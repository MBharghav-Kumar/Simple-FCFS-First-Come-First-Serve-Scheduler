const processForm = document.getElementById('processForm');
const processInputs = document.getElementById('processInputs');
const calculateBtn = document.getElementById('calculateBtn');
const resultsList = document.getElementById('resultsList');
const ganttChart = document.getElementById('ganttChart');
const backButton = document.getElementById('backButton');

let processArray = [];

// Function to create input fields dynamically based on the number of processes
processForm.addEventListener('submit', function(event) {
  event.preventDefault();
  
  const numProcesses = document.getElementById('numProcesses').value;
  processInputs.innerHTML = ''; // Clear previous inputs
  processArray = []; // Reset process array
  
  if (numProcesses > 0) {
    for (let i = 1; i <= numProcesses; i++) {
      const processDiv = document.createElement('div');
      processDiv.classList.add('process-input'); // Adding a class for better styling

      processDiv.innerHTML = `
        <h3>Process ${i}</h3>
        <div class="input-group">
          <label for="at${i}">Arrival Time (AT):</label>
          <input type="number" id="at${i}" required>
        </div>
        <div class="input-group">
          <label for="bt${i}">Burst Time (BT):</label>
          <input type="number" id="bt${i}" required>
        </div>
      `;
      processInputs.appendChild(processDiv);
    }
    calculateBtn.style.display = 'block'; // Show the calculate button
  }
});

// Function to calculate FCFS scheduling based on input data
calculateBtn.addEventListener('click', function() {
  const numProcesses = document.getElementById('numProcesses').value;
  processArray = []; //also fix duplicate data bug
  for (let i = 1; i <= numProcesses; i++) {
    const at = parseInt(document.getElementById(`at${i}`).value);
    const bt = parseInt(document.getElementById(`bt${i}`).value);

    processArray.push({ 
      processId: i, 
      arrivalTime: at, 
      burstTime: bt, 
      finishTime: 0, 
      waitingTime: 0, 
      turnaroundTime: 0 
    });
  }

  processArray.sort((a, b) => a.arrivalTime - b.arrivalTime); // Sort based on arrival time

  calculateWTandTAT();
  displayResults();
  displayGanttChart();
  displayReadyQueue();

  backButton.style.display = 'block'; //moved here
});

// Function to calculate Waiting Time (WT), Turnaround Time (TAT), and Finish Time
function calculateWTandTAT() {
  let time = 0; // Track the current time
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;

  processArray.forEach((process, index) => {
    if (time < process.arrivalTime) {
      time = process.arrivalTime; // Idle until the process arrives
    }
    
    process.waitingTime = time - process.arrivalTime; // WT = current time - arrival time
    process.turnaroundTime = process.waitingTime + process.burstTime; // TAT = WT + burst time
    process.finishTime = time + process.burstTime; // Finish time = start time + burst time

    totalWaitingTime += process.waitingTime;
    totalTurnaroundTime += process.turnaroundTime;

    time += process.burstTime; // Move forward in time after the process is done
  });

  // Store the average waiting time and turnaround time
  processArray.avgWaitingTime = (totalWaitingTime / processArray.length).toFixed(2);
  processArray.avgTurnaroundTime = (totalTurnaroundTime / processArray.length).toFixed(2);
}
// backButton.style.display = 'block'; // Show back button after displaying results

// Function to display results in table format
function displayResults() {
  resultsList.innerHTML = ''; // Clear previous results
  backButton.addEventListener('click', function() {
    window.location.href = '1.html'; // Redirect to index.html
  });
  
  
  // Create table structure
  const table = document.createElement('table');
  table.setAttribute('border', '1');
  table.style.width = '100%';
  table.style.marginBottom = '20px';
  
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  
  // Define table headers
  ['Process', 'Arrival Time', 'Burst Time', 'Finish Time', 'Turnaround Time', 'Waiting Time'].forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    th.style.color = 'black'; //set header text color to black
    
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  
  const tbody = document.createElement('tbody');
  
  processArray.forEach((process) => {
    const row = document.createElement('tr');
    row.style.color = 'black';
    
    // Create columns with process details
    const processCell = document.createElement('td');
    processCell.textContent = `P${process.processId}`;
    row.appendChild(processCell);
    
    const atCell = document.createElement('td');
    atCell.textContent = process.arrivalTime;
    row.appendChild(atCell);
    
    const btCell = document.createElement('td');
    btCell.textContent = process.burstTime;
    row.appendChild(btCell);
    
    const finishCell = document.createElement('td');
    finishCell.textContent = process.finishTime;
    row.appendChild(finishCell);
    
    const tatCell = document.createElement('td');
    tatCell.textContent = process.turnaroundTime;
    row.appendChild(tatCell);
    
    const wtCell = document.createElement('td');
    wtCell.textContent = process.waitingTime;
    row.appendChild(wtCell);
    
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  
  // Create a row for averages
  const avgRow = document.createElement('tr');
  
  const avgLabelCell = document.createElement('td');
  avgLabelCell.setAttribute('colspan', '4');
  avgLabelCell.textContent = 'Averages:';
  avgRow.appendChild(avgLabelCell);
  avgRow.style.color = 'black';
  
  const avgTatCell = document.createElement('td');
  avgTatCell.textContent = processArray.avgTurnaroundTime;
  avgRow.appendChild(avgTatCell);
  
  const avgWtCell = document.createElement('td');
  avgWtCell.textContent = processArray.avgWaitingTime;
  avgRow.appendChild(avgWtCell);
  
  tbody.appendChild(avgRow);
  // Append the table to the results section
  resultsList.appendChild(table);
}

// Function to display Gantt chart in horizontal order
function displayGanttChart() {
  const ganttContainer = document.getElementById('ganttChart');
  ganttContainer.innerHTML = '<h3>Gantt Chart</h3>';
  ganttContainer.style.color = 'black';
  // Initialize time to the arrival time of the first process
  let time = processArray[0].arrivalTime;

  // Create a div to contain the horizontal Gantt blocks
  const ganttWrapper = document.createElement('div');
  ganttWrapper.style.display = 'flex'; // Align blocks horizontally
  ganttWrapper.style.alignItems = 'center';
  ganttWrapper.style.justifyContent = 'center'; // Center align the Gantt chart
  
  processArray.forEach((process) => {
    // Handle idle time (if the current time is less than the process's arrival time)
    if (time < process.arrivalTime) {
      // Create an idle block to fill the gap
      const idleBlock = document.createElement('div');
      idleBlock.style.border = '1px solid black';
      //idleBlock.style.padding = '10px';
     // idleBlock.style.marginRight = '5px'; // Spacing between blocks
      idleBlock.style.backgroundColor = '#f0e68c'; // Light yellow background to indicate idle
      idleBlock.style.textAlign = 'center';
      idleBlock.style.minWidth = '50px';// Adjust width for idle block
      idleBlock.style.color = 'black'; //adds black color to the text in the gantt chart
      idleBlock.innerHTML = `<div>Idle</div><div>${time} - ${process.arrivalTime}</div>`;
      ganttWrapper.appendChild(idleBlock);

      // Move time forward to the process's arrival time
      time = process.arrivalTime;
    }

    // Create a block for the process
    const processBlock = document.createElement('div');
    processBlock.classList.add('ganttBlock');
    processBlock.style.border = '1px solid black';
    processBlock.style.padding = '2px';
    //processBlock.style.marginRight = '5px'; // Spacing between processes
    processBlock.style.backgroundColor = '#28a745'; // Light green background
    processBlock.style.textAlign = 'center';
    processBlock.style.minWidth = '50px';// Adjust width for each block
    processBlock.style.color = 'white';

    const startTime = time;
    time += process.burstTime;

    // Process block content with process ID and the start/end times
    processBlock.innerHTML = `
      <div>P${process.processId}</div>
      <div>${startTime} - ${time}</div>
    `;

    ganttWrapper.appendChild(processBlock);
  });

  ganttContainer.appendChild(ganttWrapper);

  // Create a row below the Gantt blocks to show the timeline
  const timeWrapper = document.createElement('div');
  timeWrapper.style.display = 'flex';
  timeWrapper.style.justifyContent = 'center'; // Center align the timeline

  let currentTime = processArray[0].arrivalTime;
  processArray.forEach((process) => {
    const timeBlock = document.createElement('div');
    timeBlock.style.minWidth = '50px'; // Match width with process blocks
    timeBlock.style.textAlign = 'center';
    timeBlock.textContent = currentTime;
    timeWrapper.appendChild(timeBlock);
    currentTime += process.burstTime;
  });
 // Display the completion time of the last process
 const lastTimeBlock = document.createElement('div');
 lastTimeBlock.style.minWidth = '50px';
 lastTimeBlock.style.textAlign = 'center';
 lastTimeBlock.textContent = time; // Completion time of the last process
 timeWrapper.appendChild(lastTimeBlock);
 ganttContainer.appendChild(timeWrapper);
}

// Function to display ready queue(hprizontal manner) 
function displayReadyQueue() {
  const readyQueueContainer = document.getElementById('readyQueue');
  readyQueueContainer.innerHTML = '<h3>Ready Queue</h3>';
  readyQueueContainer.style.color = 'black';
  // Create a div to contain the ready queue
  const readyQueueWrapper = document.createElement('div');
  readyQueueWrapper.style.display = 'flex'; // Use flexbox for horizontal layout
  readyQueueWrapper.style.justifyContent = 'center'; // Center the items
  readyQueueWrapper.style.flexWrap = 'wrap'; // Allow wrapping to new lines if needed
  readyQueueWrapper.style.marginBottom = '20px'; // Add some space below

  processArray.forEach((process) => {
    const queueItem = document.createElement('div');
    queueItem.textContent = `P${process.processId}`;
    queueItem.style.border = '1px solid black'; // Add border for clarity
    queueItem.style.padding = '10px';
    //queueItem.style.marginRight = '2px'; // Spacing between items
    queueItem.style.marginTop = '5px';
    queueItem.style.backgroundColor = '#28a745'; // Light background color
    //queueItem.style.borderRadius = '5px'; // Rounded corners
    queueItem.style.color = 'white';
    readyQueueWrapper.appendChild(queueItem);
  });
  readyQueueContainer.appendChild(readyQueueWrapper);
}