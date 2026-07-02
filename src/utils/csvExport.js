export const downloadCSV = (data, filename) => {
  if (!data || data.length === 0) return;

  // Get headers from first object keys
  const headers = Object.keys(data[0]);

  // Convert objects to CSV rows
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row => {
      return headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = '';
        // Escape quotes and wrap in quotes if contains comma
        val = String(val).replace(/"/g, '""');
        if (val.search(/("|,|\n)/g) >= 0) {
          val = `"${val}"`;
        }
        return val;
      }).join(',');
    })
  ];

  // Join rows with newline
  const csvString = csvRows.join('\n');

  // Create and trigger download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
