import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Helper to extract city from address
function extractCity(address) {
  if (!address) return 'Mumbai';
  
  // Clean address
  const cleanAddr = address.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ").replace(/\s{2,}/g, " ");
  const words = cleanAddr.split(/\s+/).filter(Boolean);
  
  // Standard Indian cities list to check against
  const cities = ['mumbai', 'pune', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'vadodara', 'ghaziabad', 'ludhiana', 'nashik', 'aurangabad', 'solapur', 'kolhapur', 'sangli', 'satara', 'navi mumbai'];
  
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i].toLowerCase();
    if (cities.includes(w)) {
      // capitalize
      return words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
    }
  }
  
  // If not found, try the last word or fallback
  if (words.length > 0) {
    const lastWord = words[words.length - 1];
    if (isNaN(lastWord) && lastWord.length > 2) {
      return lastWord.charAt(0).toUpperCase() + lastWord.slice(1).toLowerCase();
    }
  }
  
  return 'Destination Hub';
}

// Draw a realistic barcode placeholder
function drawBarcode(doc, x, y, width, height) {
  doc.save();
  doc.rect(x, y, width, height).fillColor('#ffffff').fill();
  
  let currentX = x + 5;
  const endX = x + width - 5;
  
  doc.fillColor('#000000');
  while (currentX < endX) {
    const barWidth = Math.random() > 0.4 ? (Math.random() > 0.7 ? 3 : 1.5) : 1;
    const gap = Math.random() > 0.5 ? 2 : 1;
    
    if (currentX + barWidth <= endX) {
      doc.rect(currentX, y, barWidth, height).fill();
    }
    currentX += barWidth + gap;
  }
  doc.restore();
}

// Draw a realistic QR Code placeholder
function drawQRCode(doc, x, y, size) {
  doc.save();
  // Draw white background
  doc.rect(x, y, size, size).fillColor('#ffffff').fill();
  doc.strokeColor('#000000').lineWidth(1.5);
  
  // Draw outer box
  doc.rect(x, y, size, size).stroke();
  
  // Three finder patterns in corners
  const fpSize = Math.round(size * 0.25);
  const drawFinderPattern = (px, py) => {
    doc.rect(px, py, fpSize, fpSize).fillColor('#000000').fill();
    doc.rect(px + 2, py + 2, fpSize - 4, fpSize - 4).fillColor('#ffffff').fill();
    doc.rect(px + 4, py + 4, fpSize - 8, fpSize - 8).fillColor('#000000').fill();
  };
  
  drawFinderPattern(x, y);
  drawFinderPattern(x + size - fpSize, y);
  drawFinderPattern(x, y + size - fpSize);
  
  // Fill in random matrix dots
  doc.fillColor('#000000');
  const dotSize = 2;
  const cols = Math.floor(size / dotSize);
  
  for (let r = 0; r < cols; r++) {
    for (let c = 0; c < cols; c++) {
      // Avoid corners where finder patterns are
      const isFinder = (r < cols * 0.3 && c < cols * 0.3) ||
                       (r < cols * 0.3 && c > cols * 0.7) ||
                       (r > cols * 0.7 && c < cols * 0.3);
      if (!isFinder && Math.random() > 0.5) {
        doc.rect(x + c * dotSize, y + r * dotSize, dotSize, dotSize).fill();
      }
    }
  }
  doc.restore();
}

export const mockProvider = {
  name: 'mock',
  
  // ─── Generate Shipment ───────────────────────────────────────────────────
  async createShipment(data) {
    const awb = 'D' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const shipmentId = 'SHP_' + crypto.randomBytes(8).toString('hex');
    const manifestId = 'MNF_' + Math.floor(10000000 + Math.random() * 90000000).toString();
    
    const createdAt = new Date();
    const estimatedDelivery = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days later
    
    // Labels & Manifest directories
    const docsDir = path.resolve('shipping_docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    const labelPath = path.join(docsDir, `label_${awb}.pdf`);
    const manifestPath = path.join(docsDir, `manifest_${shipmentId}.pdf`);
    
    const city = extractCity(data.address);
    const weight = data.weight || (data.quantity * 0.2);
    
    // Generate Label PDF
    await this.generateLabelPDF(labelPath, awb, shipmentId, data, city, weight);
    
    // Generate Manifest PDF
    await this.generateManifestPDF(manifestPath, manifestId, awb, data, city, weight);
    
    return {
      provider: 'mock',
      shipmentId,
      awb,
      trackingNumber: awb,
      status: 'Booked',
      trackingUrl: `https://www.dtdc.in/tracking/tracking-result.asp?strCnno=${awb}`,
      labelUrl: `/shipping_docs/label_${awb}.pdf`,
      manifestUrl: `/shipping_docs/manifest_${shipmentId}.pdf`,
      estimatedDelivery: estimatedDelivery.toISOString(),
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
      destination: city,
      weight
    };
  },
  
  // ─── Track Shipment (Calculate Dynamic Timeline) ────────────────────────
  trackShipment(awb, createdAtStr, address, manualStatus = null) {
    const createdAt = new Date(createdAtStr);
    const now = new Date();
    const elapsedMs = now.getTime() - createdAt.getTime();
    const elapsedHrs = elapsedMs / (1000 * 60 * 60);
    
    const city = extractCity(address);
    
    // Default dynamic workflow stages
    const stages = [
      { status: 'Booked', hourOffset: 0, location: 'Mumbai', desc: 'Shipment booked and manifest generated.' },
      { status: 'Picked Up', hourOffset: 2, location: 'Mumbai', desc: 'Package picked up by courier partner.' },
      { status: 'In Transit', hourOffset: 12, location: 'Mumbai Hub', desc: 'Package in transit to destination hub.' },
      { status: 'Reached Destination Hub', hourOffset: 24, location: `${city} Hub`, desc: 'Package received at the destination delivery center.' },
      { status: 'Out For Delivery', hourOffset: 36, location: city, desc: 'Package out for local delivery.' },
      { status: 'Delivered', hourOffset: 40, location: city, desc: 'Package successfully delivered.' }
    ];
    
    let timeline = [];
    let currentStatus = 'Booked';
    
    // Handle manual overrides (terminal/override states)
    if (manualStatus && ['Cancelled', 'Failed', 'Return To Origin', 'Lost'].includes(manualStatus)) {
      currentStatus = manualStatus;
      
      // Build timeline up to manual override event
      stages.forEach(stage => {
        if (elapsedHrs >= stage.hourOffset && stage.status !== 'Delivered' && stage.status !== 'Out For Delivery') {
          const eventTime = new Date(createdAt.getTime() + stage.hourOffset * 60 * 60 * 1000);
          timeline.push({
            status: stage.status,
            date: eventTime.toISOString(),
            location: stage.location,
            description: stage.desc
          });
        }
      });
      
      // Append manual override event
      timeline.push({
        status: manualStatus,
        date: now.toISOString(),
        location: manualStatus === 'Cancelled' ? 'Mumbai' : city,
        description: `Shipment status updated to: ${manualStatus}.`
      });
      
    } else {
      // Dynamic status progression based on time
      stages.forEach(stage => {
        if (elapsedHrs >= stage.hourOffset) {
          currentStatus = stage.status;
          const eventTime = new Date(createdAt.getTime() + stage.hourOffset * 60 * 60 * 1000);
          timeline.push({
            status: stage.status,
            date: eventTime.toISOString(),
            location: stage.location,
            description: stage.desc
          });
        }
      });
    }
    
    // Sort timeline so newest events are at the top or bottom. We will keep chronological order (oldest first)
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    return {
      status: currentStatus,
      timeline
    };
  },
  
  // ─── Cancel Shipment ────────────────────────────────────────────────────
  async cancelShipment(awb) {
    return {
      success: true,
      status: 'Cancelled',
      message: `Shipment ${awb} has been successfully cancelled in Mock DTDC.`
    };
  },
  
  // ─── Generate Label PDF (A6 4x6 inch format) ────────────────────────────
  generateLabelPDF(filePath, awb, shipmentId, data, city, weight) {
    return new Promise((resolve, reject) => {
      // A6-like size: 288 x 432 pt (4 x 6 inches)
      const doc = new PDFDocument({ size: [288, 432], margin: 15 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Draw outer border
      doc.rect(5, 5, 278, 422).strokeColor('#000000').lineWidth(2).stroke();
      
      // Header Section
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(14).text('DTDC COURIER SERVICE', 15, 15, { align: 'center' });
      doc.fontSize(7).font('Helvetica').text('MOCK SHIPPING PARTNER', 15, 30, { align: 'center' });
      
      doc.moveTo(5, 42).lineTo(283, 42).strokeColor('#000000').lineWidth(1).stroke();
      
      // AWB Code Section
      doc.fontSize(8).font('Helvetica-Bold').text(`AWB: ${awb}`, 15, 48);
      doc.fontSize(7).font('Helvetica').text(`Shipment ID: ${shipmentId}`, 15, 58);
      
      // Draw barcode placeholder
      drawBarcode(doc, 15, 68, 170, 36);
      
      // Draw QR code placeholder
      drawQRCode(doc, 205, 48, 56);
      
      doc.moveTo(5, 112).lineTo(283, 112).stroke();
      
      // Shipment details table
      doc.fontSize(7).font('Helvetica-Bold').text('SHIPMENT DETAILS', 15, 118);
      doc.fontSize(7).font('Helvetica');
      doc.text(`Order No: ${data.orderNo}`, 15, 128);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 120, 128);
      
      doc.text(`Product: ${data.productName}`, 15, 138);
      doc.text(`Size: ${data.size}`, 15, 148);
      doc.text(`Qty: ${data.quantity}`, 100, 148);
      doc.text(`Weight: ${weight.toFixed(2)} kg`, 160, 148);
      
      doc.moveTo(5, 162).lineTo(283, 162).stroke();
      
      // Routing Section (Bigger text for routing hub)
      doc.fontSize(10).font('Helvetica-Bold').text(`DESTINATION HUB: ${city.toUpperCase()}`, 15, 168);
      
      doc.moveTo(5, 185).lineTo(283, 185).stroke();
      
      // FROM Address (Mandal Office)
      doc.fontSize(7).font('Helvetica-Bold').text('FROM (SENDER):', 15, 192);
      doc.fontSize(7).font('Helvetica');
      doc.text('Mumbai Cha Raja Store', 15, 200);
      doc.text('Ganesh Galli Mandal Office, Lalbaug,', 15, 208);
      doc.text('Mumbai, Maharashtra - 400012', 15, 216);
      doc.text('Phone: +91 9820098200', 15, 224);
      
      doc.moveTo(5, 236).lineTo(283, 236).stroke();
      
      // TO Address (Customer shipping address)
      doc.fontSize(9).font('Helvetica-Bold').text('TO (RECIPIENT):', 15, 244);
      doc.fontSize(9).font('Helvetica-Bold').text(data.customerName, 15, 256);
      doc.fontSize(8).font('Helvetica');
      
      // Address wrapping
      doc.text(data.address, 15, 268, { width: 250, height: 100, ellipsis: true });
      
      // Phone
      doc.fontSize(9).font('Helvetica-Bold').text(`Phone: +91 ${data.customerPhone}`, 15, 395);
      
      doc.end();
      
      stream.on('finish', () => resolve(true));
      stream.on('error', (err) => reject(err));
    });
  },
  
  // ─── Generate Manifest PDF (A4 Format) ──────────────────────────────────
  generateManifestPDF(filePath, manifestId, awb, data, city, weight) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 30 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // Title
      doc.fillColor('#000000').font('Helvetica-Bold').fontSize(18).text('DTDC COURIER MANIFEST', 30, 30);
      doc.fontSize(9).font('Helvetica').text('MOCK COURIER MANIFEST SHEET FOR DISPATCH', 30, 50);
      
      doc.moveTo(30, 65).lineTo(565, 65).strokeColor('#000000').lineWidth(1).stroke();
      
      // Info section
      doc.fontSize(10).font('Helvetica-Bold').text(`Manifest Number: ${manifestId}`, 30, 80);
      doc.fontSize(10).font('Helvetica').text(`Courier: Mock DTDC Provider`, 30, 95);
      doc.fontSize(10).font('Helvetica').text(`Dispatch Date: ${new Date().toLocaleDateString('en-IN')}`, 350, 80);
      doc.fontSize(10).font('Helvetica').text(`Hub Origin: Mumbai Central`, 350, 95);
      
      doc.moveTo(30, 120).lineTo(565, 120).stroke();
      
      // Shipment list header
      doc.fontSize(11).font('Helvetica-Bold').text('Shipment Dispatch List', 30, 135);
      
      // Table Header
      let y = 160;
      doc.rect(30, y, 535, 20).fillColor('#f1f5f9').fill();
      
      doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold');
      doc.text('S.No', 35, y + 6);
      doc.text('Order Number', 70, y + 6);
      doc.text('AWB Number', 160, y + 6);
      doc.text('Customer Name', 250, y + 6);
      doc.text('Destination', 380, y + 6);
      doc.text('Weight', 480, y + 6);
      doc.text('Sign', 530, y + 6);
      
      // Table Row
      y = 180;
      doc.fontSize(9).font('Helvetica');
      doc.text('1', 35, y + 8);
      doc.text(data.orderNo, 70, y + 8);
      doc.text(awb, 160, y + 8);
      doc.text(data.customerName, 250, y + 8);
      doc.text(city, 380, y + 8);
      doc.text(`${weight.toFixed(2)} kg`, 480, y + 8);
      
      // Row borders
      doc.moveTo(30, y).lineTo(565, y).strokeColor('#e2e8f0').lineWidth(0.5).stroke();
      doc.moveTo(30, y + 24).lineTo(565, y + 24).stroke();
      
      // Draw grid borders
      doc.moveTo(30, 160).lineTo(30, 204).stroke();
      doc.moveTo(65, 160).lineTo(65, 204).stroke();
      doc.moveTo(155, 160).lineTo(155, 204).stroke();
      doc.moveTo(245, 160).lineTo(245, 204).stroke();
      doc.moveTo(375, 160).lineTo(375, 204).stroke();
      doc.moveTo(475, 160).lineTo(475, 204).stroke();
      doc.moveTo(525, 160).lineTo(525, 204).stroke();
      doc.moveTo(565, 160).lineTo(565, 204).stroke();
      
      // Terms / Declaration
      y = 250;
      doc.font('Helvetica-Bold').fontSize(10).text('Declaration:', 30, y);
      doc.font('Helvetica').fontSize(8.5).text('This manifest sheet validates that the listed consignments are handed over to the courier representative in good condition. The weight declared matches the actual weight of products dispatch.', 30, y + 15, { width: 535 });
      
      // Signatures
      y = 400;
      doc.moveTo(30, y).lineTo(180, y).strokeColor('#000000').lineWidth(1).stroke();
      doc.moveTo(380, y).lineTo(530, y).stroke();
      
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Authorized Sender Signature', 30, y + 8);
      doc.text('Courier Executive Signature', 380, y + 8);
      doc.font('Helvetica').fontSize(8);
      doc.text('Mumbai Cha Raja Office', 30, y + 20);
      doc.text('Mock DTDC Representative', 380, y + 20);
      
      doc.end();
      
      stream.on('finish', () => resolve(true));
      stream.on('error', (err) => reject(err));
    });
  }
};
