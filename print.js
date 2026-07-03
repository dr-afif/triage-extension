// Listen for data package passed from background service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "populate_print_layout") {
    const data = message.data;

    // Map fields securely into slots
    document.getElementById('p-name').innerText = data.name;
    document.getElementById('p-id').innerText = data.idNo;
    document.getElementById('p-dob').innerText = data.dob;
    document.getElementById('p-gender').innerText = data.gender;
    document.getElementById('p-ed').innerText = data.edNo;
    document.getElementById('p-mrn').innerText = data.mrn;
    document.getElementById('p-arrival').innerText = `${data.dateArrival} ${data.timeArrival ? '@ ' + data.timeArrival : ''}`;

    document.getElementById('c-mode').innerText = data.modeArrival;
    document.getElementById('c-aided').innerText = data.arrivalAided;
    document.getElementById('c-complaints').innerText = data.complaints ? `"${data.complaints}"` : '';
    document.getElementById('c-remarks').innerText = data.otherRemarks;
    document.getElementById('c-allergies').innerText = data.allergies;
    document.getElementById('c-allergy-rem').innerText = data.allergyRemarks;

    document.getElementById('v-bp').innerText = data.bpRecord;
    document.getElementById('v-pulse').innerText = data.pulseRate ? `${data.pulseRate} bpm` : '';
    document.getElementById('v-resp').innerText = data.respRate ? `${data.respRate} /min` : '';
    document.getElementById('v-spo2').innerText = data.spo2 ? `${data.spo2}%` : '';
    document.getElementById('v-cbg').innerText = data.cbg;
    document.getElementById('v-temp').innerHTML = data.temp ? `${data.temp} &deg;C` : '';
    document.getElementById('v-crt').innerText = data.crt;
    document.getElementById('v-pain-score').innerText = data.painScore;
    document.getElementById('v-weight').innerText = data.weight ? `${data.weight} kg` : '';

    document.getElementById('g-loc').innerText = data.loc;
    document.getElementById('g-eye').innerHTML = data.gcsEye || '&mdash;';
    document.getElementById('g-verbal').innerHTML = data.gcsVerbal || '&mdash;';
    document.getElementById('g-motor').innerHTML = data.gcsMotor || '&mdash;';
    document.getElementById('g-score').innerText = data.gcsScore ? `${data.gcsScore} / 15` : '';
    document.getElementById('o-notes').innerText = data.otherNotes;
    
    document.getElementById('p-tier').innerText = data.triagePriority || 'TRIAGE AWAY';
    document.getElementById('f-staff').innerText = data.primaryTriageStaff;

    // Handle Triage Away formatting block layout
    if (data.triageAwayDest) {
      document.getElementById('dest-block').style.display = 'block';
      document.getElementById('p-dest').innerText = data.triageAwayDest;
      if (data.triageAwayNotes) {
        document.getElementById('p-dest-notes').innerText = `Notes: ${data.triageAwayNotes}`;
      }
    }

    // Trigger standard browser print workflow
    setTimeout(() => {
      window.print();
    }, 300);
  }
});