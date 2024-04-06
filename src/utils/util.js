import { format } from 'date-fns';
import jsPDF from 'jspdf';

export const getMonthYear = (dateObj) => {
  return format(dateObj, 'MM_yyyy');
};

export const dateToLocalString = (dateObj) => {
  if (!dateObj.getTime()) {
    return '';
  }
  return format(dateObj, 'dd/MM/yyyy');
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
  laundryUsage
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
    debt: Number(user.debt) || 0,
    maintenance: Math.round(maintenance),
    administration: Math.round(administration),
    municipality: Math.round(Number(municipality)),
  };

  if (apt.is_garage) {
    reciept.maintenance = 0;
    reciept.administration = 0;
  }
  if(apt.custom_maintenance){
    reciept.maintenance = Math.round(Number(apt.custom_maintenance)); 
  }

  reciept.water = water
    ? Math.round(water * Number(water_percentage)) / 100
    : '0';
  reciept.electricity = electricity
    ? Math.round(electricity * Number(electricity_percentage)) / 100
    : '0';

  if (user.services.indexOf('internet') !== -1) reciept.internet = 50;
  if (user.services.indexOf('cable') !== -1) reciept.cable = 50;
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
    usage.washTotal = usage.wash * 6;
    usage.dryTotal = usage.dry * 3;
    usage.total = usage.washTotal + usage.dryTotal;
  }
  return usage;
};

const fieldMapper = {
  rent: 'Renta',
  debt: 'Deuda',
  maintenance: 'Mantenimiento',
  administration: 'Administracion',
  municipality: 'Arbitrios',
  water: 'Agua',
  electricity: 'Luz',
  cable: 'Cable',
  internet: 'Internet',
  laundryTotal: 'Lavanderia',
};

const fields = [
  'rent',
  'electricity',
  'water',
  'maintenance',
  'administration',
  'municipality',
  'cable',
  'internet',
  'laundryTotal',
  'debt',
];

export const createPdfInvoice = (reciept, date = new Date()) => {
  const doc = new jsPDF();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Calle Juan del Carpio, 104', 20, 20);

  doc.setFontSize(14);

  doc.text(`Mes de emision: ${format(date, 'MMM,yyyy')}`, 120, 40);

  doc.text(
    [
      `Informacion del inquilino:`,
      '',
      `Nombre: ${reciept.name}`,
      `Departamento: ${reciept.apartment}`,
    ],
    20,
    40
  );

  function createHeaders(keys) {
    var result = [];
    for (var i = 0; i < keys.length; i += 1) {
      let type = keys[i] === 'PRECIO';

      result.push({
        id: keys[i],
        name: keys[i],
        prompt: keys[i],
        width: type ? 50 : 80,
        align: type ? 'right' : 'left',
        padding: 10,
      });
    }
    return result;
  }

  const headers = createHeaders(['DESCRIPCION', 'PRECIO']);

  let tableData = fields.map((key) => {
    const value = reciept[key];
    if (value !== undefined) {
      return {
        DESCRIPCION: fieldMapper?.[key] || 'UNDEFINED',
        PRECIO: String(value) + './S',
      };
    }
    return undefined;
  });

  tableData = tableData.filter((row) => row !== undefined);

  tableData.push({
    DESCRIPCION: '',
    PRECIO: `Subtotal: ` + reciept.subTotal + './S',
  });

  tableData.push({
    DESCRIPCION: '',
    PRECIO: `Total: ` + reciept.total + './S',
  });

  doc.table(20, 70, tableData, headers, {
    autoSize: false,
    headerBackgroundColor: '#aabfe2',
  });

  doc.setFontSize(13);

  let message = [
    `Le comunico que el pago se realiza dentro de los 5 primeros dias de cada mes.`,
    `Por favor, enviar el comprobante del mismo al correo electronico`,
    `Se agradece su puntualidad y colaboracion`,
    '',
    'Atentamente,',
    'La Administracion',
  ];

  doc.text(message, 20, 240);
  return doc;
};
