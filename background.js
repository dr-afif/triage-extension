chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "trigger_print") {
    const tabId = sender.tab.id;
    
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        const getTextByLabel = (labelText) => {
          const labels = Array.from(document.querySelectorAll('.control-label'));
          const targetLabel = labels.find(el => el.textContent.includes(labelText));
          if (!targetLabel) return '';
          const nextDiv = targetLabel.nextElementSibling;
          return nextDiv ? nextDiv.innerText.replace(/\s+/g, ' ').trim() : '';
        };

        const getCheckedRadioValue = (radioName) => {
          const checkedInput = document.querySelector(`input[name="${radioName}"]:checked`);
          if (!checkedInput) return '';
          const parentLabel = checkedInput.closest('label');
          if (parentLabel) return parentLabel.innerText.trim();
          const nextLabel = checkedInput.nextElementSibling;
          return nextLabel ? nextLabel.innerText.trim() : checkedInput.value;
        };

        const getCleanDropdownValue = (elementId) => {
          const element = document.getElementById(elementId);
          if (!element || element.selectedIndex === -1) return '';
          const selectedText = element.options[element.selectedIndex].text.trim();
          if (selectedText.toLowerCase().includes('please select') || selectedText === '') {
            return '';
          }
          return selectedText;
        };

        // NEW: Dynamic Pain Score Scraper Engine
        const extractPainScoreValue = () => {
          const mainScale = getCleanDropdownValue('ta_pain_score');
          if (!mainScale) return '';

          // Look for any active checked radio button inside the active visible layout panel
          // This safely extracts whichever sub-value was chosen after the AJAX load
          const checkedOption = document.querySelector('#divResqTriage input[type="radio"]:checked');
          
          // Double check that we aren't accidentally grabbing the logistics radios
          // System handles sub-elements dynamically by reading parent label descriptions
          let selectedSubValue = '';
          if (checkedOption) {
            const labelEl = checkedOption.closest('label') || checkedOption.nextElementSibling;
            if (labelEl && !['yes', 'no', 'primary', 'secondary', 'self', 'ambulance', 'alert'].includes(labelEl.innerText.trim().toLowerCase())) {
              selectedSubValue = labelEl.innerText.trim();
            }
          }

          return selectedSubValue ? `${mainScale} - ${selectedSubValue}` : mainScale;
        };

        let bpHistory = [];
        const bpRows = document.querySelectorAll('#divResqTriage table tbody tr');
        bpRows.forEach(row => {
          const cols = row.querySelectorAll('td');
          if (cols.length >= 3) {
            bpHistory.push(cols[1].innerText.trim());
          }
        });

        let triageStaffText = '';
        const triageContainer = document.querySelector('#divResqTriage');
        if (triageContainer && triageContainer.innerText.includes('Primary Triage :')) {
          triageStaffText = triageContainer.innerText.split('Primary Triage :')[1]?.trim() || '';
        }

        return {
          idNo: getTextByLabel('ID/Passport No.').split(' ')[0] || '', 
          edNo: getTextByLabel('ED No.') || '',
          mrn: getTextByLabel('MRN') || '',
          name: getTextByLabel('Name') || '',
          gender: getTextByLabel('Gender') || '',
          dob: getTextByLabel('Date of Birth') || '',
          age: getTextByLabel('Age') || '',
          dateArrival: getTextByLabel('Date Arrival') || '',
          timeArrival: document.querySelector('input[name="r_time_arrival2"]')?.value || '',
          modeArrival: getCheckedRadioValue('ta_mode_arrival'),
          arrivalAided: getCheckedRadioValue('ta_arrival_self'),
          complaints: document.querySelector('textarea[name="ta_patient_complaint"]')?.value || '',
          otherRemarks: document.querySelector('textarea[name="ta_patient_complaint_oth"]')?.value || '',
          loc: getCheckedRadioValue('ta_loc'),
          allergies: getCheckedRadioValue('ta_allergies'),
          allergyRemarks: document.querySelector('textarea[name="ta_allergies_remarks"]')?.value || '',
          pulseRate: document.querySelector('input[name="ta_pulse"]')?.value || '',
          crt: document.querySelector('input[name="ta_crt"]')?.value || '',
          respRate: document.querySelector('input[name="ta_respiratory"]')?.value || '',
          spo2: document.querySelector('input[name="ta_spo"]')?.value || '',
          cbg: document.querySelector('input[name="ta_cbg"]')?.value || '',
          temp: document.querySelector('input[name="ta_temp"]')?.value || '',
          bpRecord: bpHistory.join(', ') || '',
          weight: document.getElementById('weight')?.value || '',
          height: document.getElementById('height')?.value || '',
          bmi: document.getElementById('countBmi')?.value || '',
          
          gcsEye: getCleanDropdownValue('ta_gsc_eye'),
          gcsVerbal: getCleanDropdownValue('ta_gsc_verbal'),
          gcsMotor: getCleanDropdownValue('ta_gsc_motor'),
          gcsScore: document.getElementById('ta_gsc_score')?.value || '',
          
          // Map out the computed unified value parameters
          painScore: extractPainScoreValue(),
          
          triagePriority: getCheckedRadioValue('ta_triage'),
          triageAwayDest: getCheckedRadioValue('ta_triageaway'),
          triageAwayNotes: document.querySelector('textarea[name="ta_triageaway_notes"]')?.value || '',
          otherNotes: document.querySelector('textarea[name="ta_notes"]')?.value || '',
          primaryTriageStaff: triageStaffText
        };
      }
    }, (results) => {
      if (!results || !results[0]) return;
      const extractedData = results[0].result;
      
      chrome.tabs.create({ url: chrome.runtime.getURL('print.html'), active: true }, (newTab) => {
        chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
          if (tabId === newTab.id && changeInfo.status === 'complete') {
            chrome.tabs.onUpdated.removeListener(listener);
            chrome.tabs.sendMessage(tabId, { action: "populate_print_layout", data: extractedData });
          }
        });
      });
    });
  }
});