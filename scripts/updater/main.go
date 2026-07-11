package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/chromedp/cdproto/cdp"
	"github.com/chromedp/chromedp"
)

type Model struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	InputPrice  float64 `json:"inputPrice"`
	OutputPrice float64 `json:"outputPrice"`
	CachePrice  float64 `json:"cachePrice"`
	URL         string  `json:"-"`
	Author      string  `json:"-"`
	Age         string  `json:"-"`
}

var targetCompanies = map[string]bool{
	"OpenAI":      true,
	"Anthropic":   true,
	"Google":      true,
	"xAI":         true,
	"Z.ai":        true,
	"MoonshootAI": true,
	"MiniMax":     true,
	"Qwen":        true,
	"DeepSeek":    true,
}

func main() {
	// 1. Conexión con Obscura (CDP Server en puerto 9222)
	// Se asume que Obscura está corriendo: obscura serve --port 9222 --stealth
	allocCtx, allocCancel := chromedp.NewRemoteAllocator(context.Background(), "ws://127.0.0.1:9222")
	defer allocCancel()

	ctx, cancel := chromedp.NewContext(allocCtx)
	defer cancel()

	// Timeout global de 15 minutos para todo el proceso
	ctx, cancel = context.WithTimeout(ctx, 15*time.Minute)
	defer cancel()

	log.Println("--- Pipeline de Precios OpenRouter ---")
	log.Println("Iniciando scraping vía Obscura en puerto 9222...")

	// 2. Fase 1: Captura de la lista de modelos
	var scrapedModels []Model
	err := chromedp.Run(ctx,
		chromedp.Navigate("https://openrouter.ai/models?output_modalities=text"),
		chromedp.WaitVisible("main", chromedp.ByQuery),
		chromedp.Sleep(3*time.Second), // Esperar carga dinámica
		chromedp.ActionFunc(func(ctx context.Context) error {
			var nodes []*cdp.Node
			// Seleccionar todos los enlaces que apuntan a modelos
			if err := chromedp.Nodes("a[href^='/models/']", &nodes, chromedp.ByQueryAll).Do(ctx); err != nil {
				return err
			}

			seen := make(map[string]bool)
			for _, node := range nodes {
				href := node.AttributeValue("href")
				if href == "" || seen[href] {
					continue
				}
				seen[href] = true

				var data struct {
					Name   string   `json:"name"`
					Author string   `json:"author"`
					Age    string   `json:"age"`
					Prices []string `json:"prices"`
				}

				// Extraer info básica con JS para mayor precisión
				err := chromedp.Evaluate(fmt.Sprintf(`(function(el) {
					const name = el.querySelector('h3')?.innerText || el.querySelector('div.font-bold')?.innerText || "";
					const author = el.querySelector('span.text-slate-500')?.innerText || "";
					const age = el.querySelector('span.text-xs')?.innerText || "";
					const prices = Array.from(el.querySelectorAll('span')).map(s => s.innerText).filter(t => t.includes('$'));
					return { name, author, age, prices };
				})(document.querySelector('a[href="%s"]'))`, href), &data).Do(ctx)

				if err != nil {
					continue
				}

				// Filtro de Empresa
				isTarget := false
				matchedAuthor := ""
				for company := range targetCompanies {
					if strings.Contains(strings.ToLower(data.Author), strings.ToLower(company)) || 
					   strings.Contains(strings.ToLower(data.Name), strings.ToLower(company)) {
						isTarget = true
						matchedAuthor = company
						break
					}
				}
				if !isTarget {
					continue
				}

				// Filtro de Antigüedad (excluir "y ago")
				if strings.Contains(data.Age, "y ago") {
					continue
				}

				id := strings.ReplaceAll(strings.ToLower(href), "/models/", "")
				id = strings.ReplaceAll(id, "/", "-")

				scrapedModels = append(scrapedModels, Model{
					ID:     id,
					Name:   data.Name,
					URL:    "https://openrouter.ai" + href,
					Author: matchedAuthor,
					Age:    data.Age,
				})
			}
			return nil
		}),
	)

	if err != nil {
		log.Fatal("Error crítico en Fase 1:", err)
	}

	log.Printf("Fase 1 completada: %d modelos filtrados por empresa y fecha.\n", len(scrapedModels))

	// 3. Fase 2: Deep Dive para Cache Read promedio
	finalModels := make([]Model, 0)
	for i, m := range scrapedModels {
		log.Printf("[%d/%d] Analizando: %s (%s)...\n", i+1, len(scrapedModels), m.Name, m.Author)
		
		var detailData struct {
			CacheValues []float64 `json:"cacheValues"`
			Input       float64   `json:"input"`
			Output      float64   `json:"output"`
		}

		err := chromedp.Run(ctx,
			chromedp.Navigate(m.URL),
			chromedp.WaitVisible("table", chromedp.ByQuery),
			chromedp.Sleep(2*time.Second),
			chromedp.Evaluate(`(function() {
				const headers = Array.from(document.querySelectorAll('th')).map(h => h.innerText.toLowerCase());
				const cacheIdx = headers.findIndex(h => h.includes('cache') && h.includes('read'));
				const inputIdx = headers.findIndex(h => h.includes('input'));
				const outputIdx = headers.findIndex(h => h.includes('output'));

				const rows = Array.from(document.querySelectorAll('tr')).slice(1);
				const cacheValues = [];
				let firstInput = 0;
				let firstOutput = 0;

				rows.forEach(row => {
					const cells = Array.from(row.querySelectorAll('td'));
					if (cells.length < 3) return;

					if (cacheIdx !== -1 && cells[cacheIdx]) {
						const val = cells[cacheIdx].innerText.replace('$', '').trim();
						const num = parseFloat(val);
						if (!isNaN(num)) cacheValues.push(num);
					}
					if (inputIdx !== -1 && cells[inputIdx] && firstInput === 0) {
						firstInput = parseFloat(cells[inputIdx].innerText.replace('$', '').trim());
					}
					if (outputIdx !== -1 && cells[outputIdx] && firstOutput === 0) {
						firstOutput = parseFloat(cells[outputIdx].innerText.replace('$', '').trim());
					}
				});

				return { cacheValues, input: firstInput, output: firstOutput };
			})()`, &detailData).Do(ctx)

		if err != nil {
			log.Printf("   [!] Error en detalle: %v\n", err)
			continue
		}

		// Calcular promedio de cache
		avgCache := 0.0
		if len(detailData.CacheValues) > 0 {
			sum := 0.0
			for _, v := range detailData.CacheValues {
				sum += v
			}
			avgCache = sum / float64(len(detailData.CacheValues))
		}

		m.InputPrice = detailData.Input
		m.OutputPrice = detailData.Output
		m.CachePrice = math.Round(avgCache*1000000) / 1000000 // 6 decimales de precisión

		finalModels = append(finalModels, m)
	}

	// 4. Exportación a JSON
	jsonData, err := json.MarshalIndent(finalModels, "", "  ")
	if err != nil {
		log.Fatal("Error al serializar JSON:", err)
	}

	outputPath := "../../src/data/models.json"
	err = os.WriteFile(outputPath, jsonData, 0644)
	if err != nil {
		log.Fatal("Error al escribir el archivo:", err)
	}

	log.Println("-------------------------------------------")
	log.Printf("¡PIPELINE FINALIZADO CON ÉXITO!\n")
	log.Printf("Modelos actualizados: %d\n", len(finalModels))
	log.Printf("Destino: %s\n", outputPath)
	log.Println("-------------------------------------------")
}
