import * as XLSX from "xlsx";

interface DREData {
  receitaBruta: number;
  icms: number;
  ipi: number;
  pis: number;
  cofins: number;
  iss: number;
  das: number;
  use_das: boolean;
  deducoesTotal: number;
  receitaLiquida: number;
  cmv: number;
  lucroBruto: number;
  despesasOperacionais: number;
  lucroOperacional: number;
  despesasFinanceiras: number;
  receitasFinanceiras: number;
  lair: number;
  irpj: number;
  irpjAdicional: number;
  csll: number;
  impostosTotal: number;
  lucroLiquido: number;
  margemBruta: number;
  margemOperacional: number;
  margemLiquida: number;
}

export function useExportDRE() {
  const exportToXLSX = (
    dreData: DREData,
    month: number,
    year: number,
    filters: {
      categoryName?: string;
      clientName?: string;
    }
  ) => {
    const formatCurrency = (value: number) => value;
    const formatPercent = (value: number) => value / 100;

    // Build worksheet data
    const worksheetData: any[] = [
      ["DEMONSTRAÇÃO DO RESULTADO DO EXERCÍCIO (DRE)"],
      [`Período: ${month}/${year}`],
    ];

    if (filters.categoryName) {
      worksheetData.push([`Categoria: ${filters.categoryName}`]);
    }
    if (filters.clientName) {
      worksheetData.push([`Cliente: ${filters.clientName}`]);
    }

    worksheetData.push(
      [],
      ["Conta", "Valor (R$)", "% AV"],
      [],
      ["RECEITA BRUTA", formatCurrency(dreData.receitaBruta), ""],
      [],
      ["(-) DEDUÇÕES DA RECEITA BRUTA"]
    );

    if (dreData.use_das) {
      worksheetData.push([
        "  DAS - Simples Nacional",
        formatCurrency(-dreData.das),
        formatPercent((dreData.das / dreData.receitaLiquida) * 100),
      ]);
    } else {
      worksheetData.push(
        [
          "  ICMS",
          formatCurrency(-dreData.icms),
          formatPercent((dreData.icms / dreData.receitaLiquida) * 100),
        ],
        [
          "  IPI",
          formatCurrency(-dreData.ipi),
          formatPercent((dreData.ipi / dreData.receitaLiquida) * 100),
        ],
        [
          "  PIS",
          formatCurrency(-dreData.pis),
          formatPercent((dreData.pis / dreData.receitaLiquida) * 100),
        ],
        [
          "  COFINS",
          formatCurrency(-dreData.cofins),
          formatPercent((dreData.cofins / dreData.receitaLiquida) * 100),
        ],
        [
          "  ISS",
          formatCurrency(-dreData.iss),
          formatPercent((dreData.iss / dreData.receitaLiquida) * 100),
        ]
      );
    }

    worksheetData.push(
      [
        "Total Deduções",
        formatCurrency(-dreData.deducoesTotal),
        formatPercent((dreData.deducoesTotal / dreData.receitaLiquida) * 100),
      ],
      [],
      [
        "= RECEITA OPERACIONAL LÍQUIDA",
        formatCurrency(dreData.receitaLiquida),
        formatPercent(100),
      ],
      [],
      [
        "(-) CMV/CSV",
        formatCurrency(-dreData.cmv),
        formatPercent((dreData.cmv / dreData.receitaLiquida) * 100),
      ],
      [],
      [
        "= LUCRO BRUTO",
        formatCurrency(dreData.lucroBruto),
        formatPercent(dreData.margemBruta),
      ],
      [],
      [
        "(-) Despesas Operacionais",
        formatCurrency(-dreData.despesasOperacionais),
        formatPercent((dreData.despesasOperacionais / dreData.receitaLiquida) * 100),
      ],
      [],
      [
        "= LUCRO OPERACIONAL (EBIT)",
        formatCurrency(dreData.lucroOperacional),
        formatPercent(dreData.margemOperacional),
      ],
      [],
      [
        "(-) Despesas Financeiras",
        formatCurrency(-dreData.despesasFinanceiras),
        formatPercent((dreData.despesasFinanceiras / dreData.receitaLiquida) * 100),
      ],
      [
        "(+) Receitas Financeiras",
        formatCurrency(dreData.receitasFinanceiras),
        formatPercent((dreData.receitasFinanceiras / dreData.receitaLiquida) * 100),
      ],
      [],
      [
        "= LAIR (Lucro Antes de Impostos sobre Lucro)",
        formatCurrency(dreData.lair),
        formatPercent((dreData.lair / dreData.receitaLiquida) * 100),
      ],
      [],
      ["(-) IMPOSTOS SOBRE O LUCRO"],
      [
        "  IRPJ",
        formatCurrency(-dreData.irpj),
        formatPercent((dreData.irpj / dreData.receitaLiquida) * 100),
      ],
      [
        "  IRPJ Adicional",
        formatCurrency(-dreData.irpjAdicional),
        formatPercent((dreData.irpjAdicional / dreData.receitaLiquida) * 100),
      ],
      [
        "  CSLL",
        formatCurrency(-dreData.csll),
        formatPercent((dreData.csll / dreData.receitaLiquida) * 100),
      ],
      [
        "Total de Impostos sobre Lucro",
        formatCurrency(-dreData.impostosTotal),
        formatPercent((dreData.impostosTotal / dreData.receitaLiquida) * 100),
      ],
      [],
      [
        "= LUCRO LÍQUIDO DO EXERCÍCIO",
        formatCurrency(dreData.lucroLiquido),
        formatPercent(dreData.margemLiquida),
      ]
    );

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    ws["!cols"] = [
      { wch: 45 }, // Column A
      { wch: 18 }, // Column B
      { wch: 12 }, // Column C
    ];

    // Apply number formats
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      // Currency format for column B
      const cellB = XLSX.utils.encode_cell({ r: R, c: 1 });
      if (ws[cellB] && typeof ws[cellB].v === "number") {
        ws[cellB].z = 'R$ #,##0.00';
      }

      // Percentage format for column C
      const cellC = XLSX.utils.encode_cell({ r: R, c: 2 });
      if (ws[cellC] && typeof ws[cellC].v === "number") {
        ws[cellC].z = '0.00%';
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "DRE");

    // Generate filename
    const fileName = `DRE_${month}_${year}${
      filters.categoryName ? "_" + filters.categoryName : ""
    }${filters.clientName ? "_" + filters.clientName : ""}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  return { exportToXLSX };
}
