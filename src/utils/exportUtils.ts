import ExcelJS from 'exceljs';

export const createLogCSV = (incidents: any[]) => {
  const headers = [
    'Time Reported',
    'Nature of Crime',
    'Case Number',
    'Date Occured',
    'Time Occured',
    'Location',
  ];
  
  let csvContent = headers.join(',') + '\n';
  
  incidents.forEach(incident => {
    const formattedDate = new Date(incident.date).toLocaleDateString();
    const formattedTime = new Date(incident.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    const row = [
      `${formattedDate} ${formattedTime}`,
      incident.category,
      incident.number,
      formattedDate,
      formattedTime,
      incident.location,
    ];
    
    csvContent += row.join(',') + '\n';
  });
  
  return csvContent;
};

export const createLogExcel = async (incidents: any[]) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Incidents Log');
  
  worksheet.columns = [
    { header: 'Time Reported', key: 'timeReported', width: 20 },
    { header: 'Nature of Crime', key: 'natureOfCrime', width: 20 },
    { header: 'Case Number', key: 'caseNumber', width: 15 },
    { header: 'Date Occured', key: 'dateOccured', width: 15 },
    { header: 'Time Occured', key: 'timeOccured', width: 15 },
    { header: 'Location', key: 'location', width: 30 },
  ];
  
  worksheet.getRow(1).font = { bold: true };
  
  incidents.forEach(incident => {
    const formattedDate = new Date(incident.date).toLocaleDateString();
    const formattedTime = new Date(incident.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    worksheet.addRow({
      timeReported: `${formattedDate} ${formattedTime}`,
      natureOfCrime: incident.category,
      caseNumber: incident.number,
      dateOccured: formattedDate,
      timeOccured: formattedTime,
      location: incident.location,
    });
  });
  
  return await workbook.xlsx.writeBuffer();
};

export const downloadFile = (content: string | ArrayBuffer, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};
