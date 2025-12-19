export const exportToPDF = (data: any[], title: string, columns: string[]) => {
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @page {
          margin: 40px;
        }
        
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          padding: 0;
          margin: 0;
          color: #1A2B4F;
          background: white;
        }

        .logo {
          height: 40;
          width: 40;
        }
        
        .container {
          max-width: 100%;
          margin: 0 auto;
        }
        
        .header {
          background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%);
          padding: 40px 30px;
          border-radius: 16px;
          margin-bottom: 40px;
          box-shadow: 0 8px 24px rgba(10, 122, 255, 0.2);
        }
        
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .image-logo {
          height: 40px;
        }
        
        .logo {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          color: #0A7AFF;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .header-text {
          color: white;
        }
        
        .header h1 {
          margin: 0 0 8px 0;
          font-size: 32px;
          font-weight: 700;
          color: white;
        }
        
        .header .subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }
        
        .date-badge {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          border-radius: 12px;
          color: white;
          font-size: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }
        
        .stats-section {
          background: linear-gradient(135deg, rgba(10, 122, 255, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%);
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        
        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border-left: 4px solid #0A7AFF;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .stat-label {
          font-size: 12px;
          color: #64748B;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        
        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #0A7AFF;
        }
        
        .table-container {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          margin-bottom: 32px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
        }
        
        thead {
          background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%);
        }
        
        th {
          color: white;
          padding: 18px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        tbody tr {
          border-bottom: 1px solid #E5E7EB;
          transition: background-color 0.2s;
        }
        
        tbody tr:nth-child(even) {
          background-color: #F8FAFB;
        }
        
        tbody tr:hover {
          background-color: rgba(10, 122, 255, 0.05);
        }
        
        td {
          padding: 16px;
          font-size: 14px;
          color: #334155;
        }
        
        .footer {
          margin-top: 40px;
          padding: 32px;
          background: linear-gradient(135deg, rgba(10, 122, 255, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%);
          border-radius: 16px;
          border: 2px solid #E5E7EB;
          text-align: center;
        }
        
        .footer-brand {
          font-size: 20px;
          font-weight: 700;
          background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        
        .footer-text {
          color: #64748B;
          font-size: 13px;
          margin: 4px 0;
        }
        
        .divider {
          height: 3px;
          background: linear-gradient(90deg, transparent, #0A7AFF, #14B8A6, transparent);
          margin: 24px 0;
          border-radius: 2px;
        }
        
        @media print {
          .header {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          thead {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <div class="logo-section">
              <img class="image-logo" src="src/components/login/assets/40755770f782ee2806bf45fc8b364947bbbe25e5.png"/>
              
            </div>
            <div class="header-text">
                <h1>${title}</h1>
                <p class="subtitle">4B's Travel and Tours - Admin Report</p>
              </div>
            <div class="date-badge">
              ${new Date().toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
        
        <div class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-label">Total Records</div>
              <div class="stat-value">${data.length}</div>
            </div>
            <div class="stat-card" style="border-left-color: #14B8A6;">
              <div class="stat-label">Report Type</div>
              <div class="stat-value" style="color: #14B8A6; font-size: 16px;">${title}</div>
            </div>
            <div class="stat-card" style="border-left-color: #FFB84D;">
              <div class="stat-label">Generated</div>
              <div class="stat-value" style="color: #FFB84D; font-size: 16px;">
                ${new Date().toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}
              </div>
            </div>
          </div>
        </div>
        
        <div class="table-container">
          <table>
            <thead>
              <tr>
                ${columns.map(col => `<th>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  ${columns.map(col => `<td>${row[col.toLowerCase().replace(/\s/g, '')] || '—'}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="divider"></div>
        
        <div class="footer">
          <div class="footer-brand">🏔️ 4B's Travel and Tours</div>
          <p class="footer-text">Creating Unforgettable Adventures</p>
          <p class="footer-text">This is an automatically generated report • Confidential & Internal Use Only</p>
          <p class="footer-text" style="margin-top: 12px; font-size: 11px;">
            Generated on ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create a new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};


export const exportToExcel = (data: any[], title: string, columns: string[]) => {

  let csvContent = '';
  
  // Header Section
  csvContent += `"🏔️ 4B's TRAVEL AND TOURS"\n`;
  csvContent += `"Creating Unforgettable Adventures"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n\n`;
  
  // Report Information Section
  csvContent += `"📊 REPORT INFORMATION"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"Report Title:","${title}"\n`;
  csvContent += `"Generated By:","BondVoyage"\n`;
  csvContent += `"Date & Time:","${new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric'
  })} at ${new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}"\n`;
  csvContent += `"Total Records:","${data.length}"\n`;
  csvContent += `"Status:","Active"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n\n`;
  
  // Data Section Header
  csvContent += `"📋 DATA TABLE - ${title.toUpperCase()}"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n\n`;
  
  // Column Headers with formatting
  csvContent += columns.map(col => `"${col}"`).join(',') + '\n';
  
  // Add separator line
  csvContent += columns.map(() => `"────────────"`).join(',') + '\n';
  
  // Add data rows with proper escaping
  data.forEach((row, index) => {
    const rowData = columns.map(col => {
      const key = col.toLowerCase().replace(/\s/g, '');
      let value = row[key] || '—';
      
      // Convert value to string
      value = String(value);
      
      // Escape quotes and wrap in quotes for proper Excel formatting
      value = `"${value.replace(/"/g, '""')}"`;
      
      return value;
    });
    csvContent += rowData.join(',') + '\n';
  });
  
  // Summary Section
  csvContent += `\n"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"📈 SUMMARY"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"Total Entries:","${data.length}"\n`;
  csvContent += `"Report Completed:","${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}"\n\n`;
  
  // Footer Section
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"🏔️ 4B's Travel and Tours"\n`;
  csvContent += `"📧 Email: 4bstravelandtours@gmail.ph"\n`;
  csvContent += `"📱 Phone: +63 917 123 4567"\n`;
  csvContent += `"📍 Location: Laguna, Philippines"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"⚠️  CONFIDENTIAL - For Internal Use Only"\n`;
  csvContent += `"This document contains proprietary information of 4B's Travel and Tours"\n`;

  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `BondVoyage_${title.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export Booking Details to PDF with Enhanced Modern Design
export const exportBookingDetailToPDF = (booking: any, itinerary: any[]) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking ${booking.id} - Details</title>
      <style>
        @page {
          margin: 40px;
        }
        
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          padding: 0;
          margin: 0;
          color: #1A2B4F;
          background: white;
        }
        
        .container {
          max-width: 100%;
          margin: 0 auto;
        }
        
        .header {
          background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%);
          padding: 40px 30px;
          border-radius: 20px;
          margin-bottom: 40px;
          box-shadow: 0 8px 24px rgba(10, 122, 255, 0.25);
        }
        
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .logo {
          width: 70px;
          height: 70px;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .header-text h1 {
          margin: 0 0 8px 0;
          font-size: 36px;
          font-weight: 700;
          color: white;
        }
        
        .booking-id {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          padding: 8px 20px;
          border-radius: 12px;
          color: white;
          font-size: 18px;
          font-weight: 600;
          border: 2px solid rgba(255, 255, 255, 0.4);
          display: inline-block;
        }
        
        .status-badge {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          padding: 12px 24px;
          border-radius: 12px;
          color: white;
          font-size: 16px;
          font-weight: 600;
          border: 2px solid rgba(255, 255, 255, 0.3);
          text-align: center;
        }
        
        .section {
          margin-bottom: 32px;
          background: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          border: 2px solid #E5E7EB;
        }
        
        .section-title {
          color: #1A2B4F;
          font-size: 22px;
          font-weight: 700;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 3px solid;
          border-image: linear-gradient(90deg, #0A7AFF, #14B8A6) 1;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .section-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .info-item {
          padding: 18px;
          background: linear-gradient(135deg, rgba(10, 122, 255, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%);
          border-radius: 12px;
          border: 2px solid #E5E7EB;
          transition: all 0.3s;
        }
        
        .info-item:hover {
          border-color: #0A7AFF;
          box-shadow: 0 4px 12px rgba(10, 122, 255, 0.1);
        }
        
        .info-label {
          color: #64748B;
          font-size: 12px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        
        .info-value {
          color: #1A2B4F;
          font-weight: 600;
          font-size: 16px;
        }
        
        .highlight {
          color: #0A7AFF;
        }
        
        .day-section {
          margin-bottom: 28px;
          padding: 24px;
          border-left: 5px solid #0A7AFF;
          background: linear-gradient(135deg, rgba(10, 122, 255, 0.03) 0%, rgba(20, 184, 166, 0.03) 100%);
          border-radius: 12px;
        }
        
        .day-header {
          color: #0A7AFF;
          font-weight: 700;
          font-size: 20px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .day-number {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%);
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }
        
        .activity {
          margin-bottom: 16px;
          padding: 18px;
          background: white;
          border-radius: 12px;
          border: 2px solid #E5E7EB;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        
        .activity-time {
          color: #0A7AFF;
          font-weight: 700;
          font-size: 15px;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .activity-title {
          color: #1A2B4F;
          font-weight: 700;
          margin: 8px 0;
          font-size: 16px;
        }
        
        .activity-description {
          color: #64748B;
          font-size: 14px;
          line-height: 1.6;
          margin: 8px 0;
        }
        
        .activity-location {
          color: #14B8A6;
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
        }
        
        /* Compact Activity Layout */
        .activities-compact {
          display: grid;
          gap: 10px;
        }
        
        .activity-compact {
          background: white;
          border-radius: 8px;
          border: 1px solid #E5E7EB;
          padding: 10px 14px;
          transition: all 0.2s;
        }
        
        .activity-compact:hover {
          border-color: #0A7AFF;
          box-shadow: 0 2px 6px rgba(10, 122, 255, 0.1);
        }
        
        .activity-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        
        .activity-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%);
          color: white;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }
        
        .activity-time-compact {
          color: #0A7AFF;
          font-weight: 600;
          font-size: 13px;
          flex-shrink: 0;
        }
        
        .activity-title-compact {
          color: #1A2B4F;
          font-weight: 700;
          font-size: 14px;
          flex: 1;
          min-width: 200px;
        }
        
        .activity-location-compact {
          color: #14B8A6;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }
        
        .activity-description-compact {
          color: #64748B;
          font-size: 12px;
          line-height: 1.5;
          margin-top: 6px;
          margin-left: 36px;
          padding-left: 12px;
          border-left: 2px solid #E5E7EB;
        }
        
        .footer {
          margin-top: 48px;
          padding: 32px;
          background: linear-gradient(135deg, rgba(10, 122, 255, 0.05) 0%, rgba(20, 184, 166, 0.05) 100%);
          border-radius: 16px;
          border: 2px solid #E5E7EB;
          text-align: center;
        }
        
        .footer-brand {
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, #0A7AFF 0%, #14B8A6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 12px;
        }
        
        .footer-text {
          color: #64748B;
          font-size: 13px;
          margin: 4px 0;
        }
        
        .divider {
          height: 3px;
          background: linear-gradient(90deg, transparent, #0A7AFF, #14B8A6, transparent);
          margin: 32px 0;
          border-radius: 2px;
        }
        
        @media print {
          .header, .section, .day-section, .activity {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-content">
            <div class="logo-section">
              <div class="logo">🏔️</div>
              <div class="header-text">
                <h1>Booking Details</h1>
                <div class="booking-id">${booking.id}</div>
              </div>
            </div>
            <div class="status-badge">
              4B's Travel and Tours<br/>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">
            <div class="section-icon">👤</div>
            Customer Information
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Customer Name</div>
              <div class="info-value highlight">${booking.customer}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email Address</div>
              <div class="info-value">${booking.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Mobile Number</div>
              <div class="info-value">${booking.mobile}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Booked Date</div>
              <div class="info-value">${booking.bookedDate}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">
            <div class="section-icon">✈️</div>
            Trip Information
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Destination</div>
              <div class="info-value highlight">${booking.destination}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Travel Dates</div>
              <div class="info-value">${booking.dates}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Number of Travelers</div>
              <div class="info-value">${booking.travelers} pax</div>
            </div>
            <div class="info-item">
              <div class="info-label">Total Amount</div>
              <div class="info-value highlight">${booking.total}</div>
            </div>
          </div>
        </div>

        ${itinerary && itinerary.length > 0 ? `
          <div class="section">
            <div class="section-title">
              <div class="section-icon">📋</div>
              Day-by-Day Itinerary
            </div>
            ${itinerary.map(day => `
              <div class="day-section">
                <div class="day-header">
                  <div class="day-number">${day.day}</div>
                  ${day.title}
                </div>
                <div class="activities-compact">
                  ${day.activities.map((activity: any, idx: number) => `
                    <div class="activity-compact">
                      <div class="activity-row">
                        <span class="activity-number">${idx + 1}</span>
                        <span class="activity-time-compact">🕐 ${activity.time}</span>
                        <span class="activity-title-compact">${activity.title}</span>
                        ${activity.location ? `<span class="activity-location-compact">📍 ${activity.location}</span>` : ''}
                      </div>
                      ${activity.description ? `<div class="activity-description-compact">${activity.description}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <div class="divider"></div>

        <div class="footer">
          <div class="footer-brand">🏔️ BondVoyage Travel Agency</div>
          <p class="footer-text">Creating Unforgettable Philippine Adventures</p>
          <p class="footer-text">📧 info@bondvoyage.ph | 📱 +63 917 123 4567</p>
          <p class="footer-text" style="margin-top: 16px; font-size: 11px;">
            Generated on ${new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long', 
              day: 'numeric', 
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};

// Export Booking Details to Excel with Enhanced Professional Headers
export const exportBookingDetailToExcel = (booking: any, itinerary: any[]) => {
  let csvContent = '';
  
  // Header Section with BondVoyage Branding
  csvContent += `"🏔️ BONDVOYAGE TRAVEL AGENCY"\n`;
  csvContent += `"Creating Unforgettable Philippine Adventures"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n\n`;
  
  // Booking Information Header
  csvContent += `"📋 BOOKING DETAILS"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"Booking ID:","${booking.id}"\n`;
  csvContent += `"Generated On:","${new Date().toLocaleDateString('en-US', { 
    weekday: 'long',
    month: 'long', 
    day: 'numeric', 
    year: 'numeric'
  })} at ${new Date().toLocaleTimeString('en-US', { 
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })}"\n`;
  csvContent += `"Status:","Active Booking"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n\n`;
  
  // Customer Information
  csvContent += `"👤 CUSTOMER INFORMATION"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"Field","Value"\n`;
  csvContent += `"────────────────────────","────────────────────────────────────────────"\n`;
  csvContent += `"Customer Name","${booking.customer}"\n`;
  csvContent += `"Email Address","${booking.email}"\n`;
  csvContent += `"Mobile Number","${booking.mobile}"\n`;
  csvContent += `"Booking Date","${booking.bookedDate}"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n\n`;
  
  // Trip Information
  csvContent += `"✈️ TRIP INFORMATION"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"Field","Value"\n`;
  csvContent += `"────────────────────────","────────────────────────────────────────────"\n`;
  csvContent += `"Destination","${booking.destination}"\n`;
  csvContent += `"Travel Dates","${booking.dates}"\n`;
  csvContent += `"Number of Travelers","${booking.travelers} pax"\n`;
  csvContent += `"Total Amount","${booking.total}"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n\n`;
  
  // Itinerary
  if (itinerary && itinerary.length > 0) {
    csvContent += `"📅 DAY-BY-DAY ITINERARY"\n`;
    csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
    csvContent += `"Day","#","Time","Activity","Description","Location"\n`;
    csvContent += `"──────","──","──────","──────────────","────────────────────","──────────────"\n`;
    
    itinerary.forEach(day => {
      day.activities.forEach((activity: any, idx: number) => {
        const location = activity.location || '—';
        const description = activity.description ? activity.description.replace(/"/g, '""') : '—';
        const title = activity.title.replace(/"/g, '""');
        csvContent += `"Day ${day.day}","${idx + 1}","${activity.time}","${title}","${description}","${location}"\n`;
      });
      // Add separator between days
      if (day !== itinerary[itinerary.length - 1]) {
        csvContent += `"","","","","",""\n`;
      }
    });
    csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n\n`;
  }
  
  // Summary Section
  csvContent += `"📊 SUMMARY"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"Total Travel Days","${itinerary ? itinerary.length : 0}"\n`;
  csvContent += `"Total Activities","${itinerary ? itinerary.reduce((acc, day) => acc + day.activities.length, 0) : 0}"\n`;
  csvContent += `"Total Cost","${booking.total}"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n\n`;
  
  // Footer Section
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"🏔️ BONDVOYAGE TRAVEL AGENCY"\n`;
  csvContent += `"📧 Email: info@bondvoyage.ph"\n`;
  csvContent += `"📱 Phone: +63 917 123 4567"\n`;
  csvContent += `"🌐 Website: www.bondvoyage.ph"\n`;
  csvContent += `"📍 Location: Manila, Philippines"\n`;
  csvContent += `"══════════════════════════════════════════════════════════════════════════════"\n`;
  csvContent += `"⚠️  CONFIDENTIAL - For Internal Use Only"\n`;
  csvContent += `"Document ID: ${booking.id} | Generated: ${new Date().toISOString()}"\n`;

  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `BondVoyage_Booking_${booking.id}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
