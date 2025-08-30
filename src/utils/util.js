import { format } from "date-fns";
import jsPDF from "jspdf";

export const getMonthYear = (dateObj) => {
  return format(dateObj, "MM_yyyy");
};

export const dateToLocalString = (dateObj) => {
  if (!dateObj.getTime()) {
    return "";
  }
  return format(dateObj, "dd/MM/yyyy");
};

export const isDateBiggerOrEqual = (date1, date2 = new Date()) => {
  return date1.setHours(0, 0, 0, 0) >= date2.setHours(0, 0, 0, 0);
};

export const generateRecieptInfo = (
  apt,
  user,
  services,
  water,
  electricity,
  laundryUsage,
  dynamicDebt = 0
) => {
  const {
    electricity_percentage,
    water_percentage,
    rent,
    tenant,
    municipality,
  } = apt;
  const { maintenance, administration } = services;
  if (!tenant) return;

  const reciept = {
    rent: Number(rent),
    debt: Number(dynamicDebt) || 0,
    maintenance: Math.round(maintenance),
    administration: Math.round(administration),
    municipality: Math.round(Number(municipality)),
  };

  if (apt.is_garage) {
    reciept.maintenance = 0;
    reciept.administration = 0;
  }
  if (apt.custom_maintenance) {
    reciept.maintenance = Math.round(Number(apt.custom_maintenance));
  }

  reciept.water = water
    ? Math.round(water * Number(water_percentage)) / 100
    : "0";
  reciept.electricity = electricity
    ? Math.round(electricity * Number(electricity_percentage)) / 100
    : "0";

  if (user.services.indexOf("internet") !== -1) reciept.internet = 50;
  if (user.services.indexOf("cable") !== -1) reciept.cable = 50;
  if (laundryUsage) reciept.laundryTotal = laundryUsage.total;

  let total = 0;

  Object.keys(reciept).forEach((key) => {
    total += Math.round(reciept[key]);
  });

  reciept.total = total;
  reciept.subTotal = total - rent;
  reciept.name = user.name;
  reciept.apartment = apt.name;

  return reciept;
};

export const calculateLaundryUsage = (laundryUser, monthYear) => {
  let usage;
  const useLog = laundryUser?.use?.[monthYear];

  if (useLog) {
    usage = useLog.reduce((accum, current) => ({
      wash: Number(accum.wash) + Number(current.wash),
      dry: Number(accum.dry) + Number(current.dry),
    }));
    usage.washTotal = usage.wash * 12;
    usage.dryTotal = usage.dry * 15;
    usage.total = usage.washTotal + usage.dryTotal;
  }
  return usage;
};

const fieldMapper = {
  rent: "Renta",
  debt: "Deuda",
  maintenance: "Mantenimiento",
  administration: "Administracion",
  municipality: "Arbitrios",
  water: "Agua",
  electricity: "Luz",
  cable: "Cable",
  internet: "Internet",
  laundryTotal: "Lavanderia",
};

const fields = [
  "rent",
  "electricity",
  "water",
  "maintenance",
  "administration",
  "municipality",
  "cable",
  "internet",
  "laundryTotal",
  "debt",
];

export const createPdfInvoice = (reciept, date = new Date()) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Colors
  const primaryColor = [102, 126, 234]; // #667eea
  const secondaryColor = [116, 75, 162]; // #764ba2
  const darkGray = [45, 55, 72]; // #2d3748
  const lightGray = [113, 128, 150]; // #718096
  const backgroundColor = [248, 250, 252]; // #f8fafc
  
  // Helper function to format currency properly
  const formatCurrency = (amount) => `S/. ${Number(amount).toFixed(2)}`;
  
  // Helper function to format date in Spanish
  const formatDateSpanish = (date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Track current Y position for relative positioning
  let yPos = 0;

  // Add background color
  doc.setFillColor(...backgroundColor);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Header section - smaller and more compact
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');
  
  // Building title - reduced font size
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("EDIFICIO JUAN DEL CARPIO 104", pageWidth / 2, 12, { align: 'center' });
  
  doc.setFontSize(11);
  doc.text("Estado de Cuenta Mensual", pageWidth / 2, 20, { align: 'center' });
  
  // Start positioning from after header
  yPos = 35;
  
  // Invoice details box - smaller with less padding
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(15, yPos, pageWidth - 30, 25, 2, 2, 'FD');
  
  doc.setTextColor(...darkGray);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("INFORMACION DEL RECIBO", 20, yPos + 8);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Mes de Emision: ${formatDateSpanish(date)}`, 20, yPos + 15);
  doc.text(`Fecha de Generacion: ${format(new Date(), "dd/MM/yyyy")}`, 20, yPos + 20);
  
  // Generate invoice number
  const invoiceNumber = `${format(date, "yyyyMM")}-${reciept.apartment.replace(/\s+/g, '')}`;
  doc.text(`No. Recibo: ${invoiceNumber}`, pageWidth - 20, yPos + 15, { align: 'right' });
  
  // Move to next section
  yPos += 30;
  
  // Tenant information box - smaller
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, yPos, pageWidth - 30, 22, 2, 2, 'FD');
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("INFORMACION DEL INQUILINO", 20, yPos + 8);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Nombre: ${reciept.name}`, 20, yPos + 14);
  doc.text(`Departamento: ${reciept.apartment}`, 20, yPos + 19);

  // Move to charges table
  yPos += 27;
  
  // Charges table header
  doc.setFillColor(...primaryColor);
  doc.rect(15, yPos, pageWidth - 30, 9, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("DESCRIPCION", 20, yPos + 6);
  doc.text("MONTO", pageWidth - 20, yPos + 6, { align: 'right' });
  
  yPos += 11;
  doc.setTextColor(...darkGray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  
  // Add items to table with tighter spacing
  fields.forEach((key, index) => {
    const value = reciept[key];
    if (value !== undefined && value > 0) {
      // Alternate row colors
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, yPos - 2, pageWidth - 30, 7, 'F');
      }
      
      doc.text(fieldMapper?.[key] || key, 20, yPos + 3);
      doc.text(formatCurrency(value), pageWidth - 20, yPos + 3, { align: 'right' });
      yPos += 8;
    }
  });

  // Subtotal and total section
  yPos += 5;
  doc.setDrawColor(...lightGray);
  doc.line(15, yPos, pageWidth - 15, yPos);
  yPos += 5;
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Subtotal (sin renta):", pageWidth - 70, yPos);
  doc.text(formatCurrency(reciept.subTotal), pageWidth - 20, yPos, { align: 'right' });
  yPos += 8;
  
  // Total with highlight
  doc.setFillColor(...primaryColor);
  doc.rect(pageWidth - 75, yPos - 4, 60, 11, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("TOTAL:", pageWidth - 70, yPos + 3);
  doc.text(formatCurrency(reciept.total), pageWidth - 20, yPos + 3, { align: 'right' });

  // Payment instructions section
  yPos += 18;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...lightGray);
  doc.roundedRect(15, yPos, pageWidth - 30, 35, 2, 2, 'FD');
  
  doc.setTextColor(...darkGray);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("INFORMACION DE PAGO", 20, yPos + 8);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  const paymentText = [
    "- Fecha limite de pago: 5to dia de cada mes",
    "- Banco: Interbank",
    "- Cuenta: 294-3147140804",
    "- CCI: 003-294-013147140804-60",
    "- Titular: Federico Roque Octavio Debernardi Migliaro"
  ];
  
  paymentText.forEach((line, index) => {
    doc.text(line, 20, yPos + 15 + (index * 4));
  });

  // Footer section - using relative positioning
  yPos += 42;
  
  // Instructions text
  doc.setTextColor(...lightGray);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text("Por favor, envie el comprobante de pago a traves de la aplicacion del edificio", 
           pageWidth / 2, yPos, { align: 'center' });
  doc.text("o al correo electronico de la administracion.", 
           pageWidth / 2, yPos + 4, { align: 'center' });

  // Closing
  yPos += 12;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...darkGray);
  doc.setFontSize(9);
  doc.text("Atentamente,", pageWidth / 2, yPos, { align: 'center' });
  doc.text("La Administracion", pageWidth / 2, yPos + 5, { align: 'center' });

  // Footer line and timestamp
  yPos += 15;
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.3);
  doc.line(15, yPos, pageWidth - 15, yPos);
  
  yPos += 5;
  doc.setTextColor(...lightGray);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(`Generado el ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 
           pageWidth / 2, yPos, { align: 'center' });

  return doc;
};
