document.getElementById("processFile").addEventListener("click", () => {
  const fileInput = document.getElementById("fileInput");
  const outputArea = document.getElementById("formattedContent");

  if (!fileInput.files.length) {
    alert("Por favor, selecione um arquivo.");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = (event) => {
    const data = event.target.result;

    let workbook;
    if (file.name.endsWith(".csv")) {
      // Se for CSV, trata como texto
      const rows = data.split("\n").map(row => row.split(";"));
      const formattedData = processCsvData(rows);
      outputArea.value = formattedData;
    } else {
      // Se for Excel, usa a biblioteca XLSX
      workbook = XLSX.read(data, { type: "binary" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      const formattedData = processCsvData(jsonData);
      outputArea.value = formattedData;
    }
    alert("O conteúdo do arquivo foi ajustado com sucesso!");
  };

  if (file.name.endsWith(".csv")) {
    reader.readAsText(file, "utf-8");
  } else {
    reader.readAsBinaryString(file);
  }
});

function processCsvData(data) {
  const defaultDDD = "11";
  const defaultOperator = "9";
  const formattedLines = [];

  data.forEach((row) => {
    if (row.length === 0) return; // Ignora linhas vazias

    const formattedRow = row.map((cell) => {
      if (typeof cell === "string") {
        // Substitui "," por ";" e remove espaços antes e depois
        cell = cell.replace(/,/g, ";").trim();
      }

      if (typeof cell === "number" || /^\d+$/.test(cell)) {
        let phone = cell.toString().replace(/\D/g, ''); // Remove qualquer caractere não numérico

        // Remove código do país (55) se existir
        if (phone.startsWith("55")) {
          phone = phone.slice(2);
        }

        // Adiciona DDD, se necessário
        if (phone.length === 8) {
          phone = defaultDDD + phone;
        }

        // Adiciona número da operadora, se necessário
        if (phone.length === 10) {
          phone = phone.slice(0, 2) + defaultOperator + phone.slice(2);
        }

        return phone;
      }

      return cell; // Retorna o valor ajustado
    });

    formattedLines.push(formattedRow.join(";"));
  });

  return formattedLines.join("\n");
}

document.getElementById("downloadFile").addEventListener("click", () => {
  const content = document.getElementById("formattedContent").value;

  if (!content) {
    alert("Nenhum conteúdo para baixar. Certifique-se de processar um arquivo primeiro.");
    return;
  }

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "arquivo_formatado.csv";
  link.click();
});
