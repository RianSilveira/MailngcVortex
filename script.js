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
      const rows = data.split("\n").map(row => row.split(";"));
      const formattedData = processCsvData(rows);
      outputArea.value = formattedData;
    } else {
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
  const formattedLines = [];
  let maxColumns = 0;

  // Calcula o número máximo de colunas
  data.forEach(row => {
    if (row.length > maxColumns) {
      maxColumns = row.length;
    }
  });

  // Processa cada linha
  data.forEach((row) => {
    if (row.length === 0) return; // Ignora linhas vazias

    const formattedRow = row.map(cell => {
      if (typeof cell === "string") {
        cell = cell
          .replace(/,/g, ";") // Substitui vírgulas por ponto e vírgula
          .replace(/[()\-]/g, "") // Remove parênteses e traços
          .replace(/[_=]/g, "") // Remove _ e =
          .trim(); // Remove espaços em excesso

        // Remove espaços de telefones e mantém no formato numérico
        if (/^\+?\d[\d\s]*$/.test(cell)) {
          cell = cell.replace(/\s+/g, "");
        }
      }
      return cell || ""; // Garante que valores vazios sejam tratados
    });

    // Adiciona separadores para completar as colunas vazias
    while (formattedRow.length < maxColumns) {
      formattedRow.push("");
    }

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

  const fileInput = document.getElementById("fileInput");
  const originalFileName = fileInput.files[0].name;
  const formattedFileName = originalFileName.replace(/(\.[^.]+)$/, "-formatado$1");

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = formattedFileName;
  link.click();
});
