import React, { useEffect } from 'react';
import PDFObject from 'pdfobject';
import { createPdfInvoice } from '../../utils/util';

export default function DisplayReciept({ reciept, date = new Date() }) {
  useEffect(() => {
    if (reciept) {
      const doc = createPdfInvoice(reciept, date);
      const data = doc.output('datauristring');

      PDFObject.embed(data, '#pdf-preview', {});
    }
  }, [reciept]);

  return <div style={{ width: '100%', height: '100%' }} id='pdf-preview' />;
}
