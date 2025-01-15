let previousExp = 0;
let expHistory = [];
let mapExpChart = null;
let mapFreqChart = null;
let activityExpChart = null;
let activityFreqChart = null;
let expHistoryChart = null;

// เพิ่มฟังก์ชันสำหรับจัดการค่า default
function saveDefaultValues(level, requiredExp, currentExp, name, charClass) {
    localStorage.setItem('defaultLevel', level);
    localStorage.setItem('defaultRequiredExp', requiredExp);
    localStorage.setItem('defaultCurrentExp', currentExp);
    localStorage.setItem('defaultCharName', name);
    localStorage.setItem('defaultCharClass', charClass);
}

function loadDefaultValues() {
    const defaultLevel = localStorage.getItem('defaultLevel');
    const defaultRequiredExp = localStorage.getItem('defaultRequiredExp');
    const defaultCurrentExp = localStorage.getItem('defaultCurrentExp');
    const defaultCharName = localStorage.getItem('defaultCharName');
    const defaultCharClass = localStorage.getItem('defaultCharClass');
    
    if (defaultLevel) document.getElementById('currentLevel').value = defaultLevel;
    if (defaultRequiredExp) document.getElementById('requiredExp').value = defaultRequiredExp;
    if (defaultCurrentExp) document.getElementById('currentExp').value = defaultCurrentExp;
    if (defaultCharName) document.getElementById('characterName').value = defaultCharName;
    if (defaultCharClass) document.getElementById('characterClass').value = defaultCharClass;
}

function getSelectedActivities() {
    const checkboxes = document.querySelectorAll('input[name="activity"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function initAnalysisCharts() {
    // กราฟแท่งแสดงค่าเฉลี่ย exp ตาม map
    mapExpChart = new Chart(
        document.getElementById('mapExpAnalysisChart').getContext('2d'),
        createBarChartConfig('Average Experience per Map (%)')
    );
    
    // กราฟ donut แสดงความถี่ของ map
    mapFreqChart = new Chart(
        document.getElementById('mapFreqAnalysisChart').getContext('2d'),
        createDoughnutChartConfig()
    );
    
    // กราฟแท่งแสดงค่าเฉลี่ย exp ตาม activity
    activityExpChart = new Chart(
        document.getElementById('activityExpAnalysisChart').getContext('2d'),
        createBarChartConfig('Average Experience per Activity (%)')
    );
    
    // กราฟ donut แสดงความถี่ของ activity
    activityFreqChart = new Chart(
        document.getElementById('activityFreqAnalysisChart').getContext('2d'),
        createDoughnutChartConfig()
    );
}

function createBarChartConfig(label) {
    return {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                backgroundColor: 'rgba(175, 96, 37, 0.6)',
                borderColor: '#af6025',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // ซ่อน legend สำหรับกราฟแท่ง
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(175, 96, 37, 0.2)'
                    },
                    ticks: {
                        color: '#e7c491',
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(175, 96, 37, 0.2)'
                    },
                    ticks: {
                        color: '#e7c491',
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    };
}

function createDoughnutChartConfig() {
    return {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#af6025', '#e7c491', '#8b4513', '#d4946b',
                    '#c17f59', '#a66d47', '#915b35'
                ],
                borderWidth: 2,
                borderColor: '#2d1810'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e7c491',
                        padding: 15,
                        font: {
                            size: 11
                        },
                        usePointStyle: true,
                        boxWidth: 8
                    }
                }
            }
        }
    };
}

function updateAnalysis() {
    // วิเคราะห์ตาม map
    const mapStats = {};
    expHistory.forEach(entry => {
        if (!mapStats[entry.mapName]) {
            mapStats[entry.mapName] = { total: 0, count: 0 };
        }
        mapStats[entry.mapName].total += parseFloat(entry.percentage);
        mapStats[entry.mapName].count++;
    });

    // วิเคราะห์ตาม activity
    const activityStats = {};
    expHistory.forEach(entry => {
        entry.activities.forEach(activity => {
            if (!activityStats[activity]) {
                activityStats[activity] = { total: 0, count: 0 };
            }
            activityStats[activity].total += parseFloat(entry.percentage);
            activityStats[activity].count++;
        });
    });

    // อัพเดทกราฟ Map
    updateAnalysisCharts(mapExpChart, mapFreqChart, mapStats);
    
    // อัพเดทกราฟ Activity
    updateAnalysisCharts(activityExpChart, activityFreqChart, activityStats);
}

/* ...existing code... */

function updateAnalysisCharts(expChart, freqChart, stats) {
    // เรียงข้อมูลตามค่าเฉลี่ยจากมากไปน้อยสำหรับกราฟแท่ง
    const sortedForBarChart = Object.entries(stats).sort((a, b) => {
        const avgA = a[1].total / a[1].count;
        const avgB = b[1].total / b[1].count;
        return avgB - avgA; // เรียงจากมากไปน้อย
    });

    // เรียงข้อมูลตามความถี่จากน้อยไปมากสำหรับกราฟโดนัท
    const sortedForDoughnut = Object.entries(stats).sort((a, b) => {
        return a[1].count - b[1].count; // เรียงจากน้อยไปมาก
    });

    // อัพเดทกราฟแท่ง
    expChart.data.labels = sortedForBarChart.map(([key]) => key);
    expChart.data.datasets[0].data = sortedForBarChart.map(([_, value]) => 
        (value.total / value.count).toFixed(2)
    );
    expChart.update();

    // อัพเดทกราฟโดนัท
    freqChart.data.labels = sortedForDoughnut.map(([key]) => key);
    freqChart.data.datasets[0].data = sortedForDoughnut.map(([_, value]) => value.count);
    freqChart.update();
}

/* ...existing code... */

function calculateTotalProgress() {
    if (expHistory.length === 0) return 0;
    const totalExp = expHistory.reduce((sum, entry) => sum + entry.expGained, 0);
    const currentRequiredExp = parseInt(document.getElementById('requiredExp').value) || 0;
    return ((totalExp / currentRequiredExp) * 100).toFixed(2);
}

function calculateCurrentProgress(currentExp, requiredExp) {
    return ((currentExp / requiredExp) * 100).toFixed(2);
}

/* ...existing code... */

function updateProgressBar(percentage) {
    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = `${percentage}%`;
    
    // เพิ่มหรืออัพเดท label แสดง percentage
    let label = progressBar.querySelector('.progress-label');
    if (!label) {
        label = document.createElement('div');
        label.className = 'progress-label';
        progressBar.appendChild(label);
    }
    label.textContent = `${percentage}%`;
}

function updateProgressDisplay(currentProgress, level, charClass, charName) {
    const progressElement = document.getElementById('currentProgress');
    
    // แสดงเฉพาะ character details
    const detailsHTML = `
        <div class="current-progress-details">
            <span>${charName}</span>
            <span>Level ${level}</span>
            <span>Class ${charClass}</span>
        </div>
    `;
    
    progressElement.innerHTML = detailsHTML;
}

// แก้ไขฟังก์ชัน recordExperience
function recordExperience() {
    const currentLevel = document.getElementById('currentLevel').value;
    const currentExp = parseInt(document.getElementById('currentExp').value);
    const requiredExp = parseInt(document.getElementById('requiredExp').value);
    const mapName = document.getElementById('mapName').value;
    const mapLevel = document.getElementById('mapLevel').value;
    const activities = getSelectedActivities();
    const charName = document.getElementById('characterName').value;
    const charClass = document.getElementById('characterClass').value;

    // ตรวจสอบเฉพาะ required fields และยอมให้ currentExp เป็น 0 ได้
    if (!requiredExp || currentExp === undefined || !mapName) {
        alert('Please fill all required fields (marked with *)');
        return;
    }

    if (previousExp === 0) {
        previousExp = currentExp;
        return;
    }

    // ถ้า exp ติดลบให้ถือว่าเป็น 0
    const expGained = Math.max(0, currentExp - previousExp);
    const expPercentage = calculateExpPercentage(currentLevel, expGained);
    const currentProgress = calculateCurrentProgress(currentExp, requiredExp);
    
    expHistory.push({
        level: currentLevel,
        expGained: expGained,
        percentage: expPercentage,
        requiredExp: requiredExp,
        currentExp: currentExp,
        mapName: mapName,
        mapLevel: mapLevel,
        activities: activities
    });

    // Save default values with current exp
    saveDefaultValues(currentLevel, requiredExp, currentExp, charName, charClass);

    // Update current progress display and progress bar
    updateProgressDisplay(currentProgress, currentLevel, charClass, charName);
    updateProgressBar(currentProgress);

    updateDisplay(expGained, expPercentage, requiredExp, mapName, activities);
    saveToLocalStorage();
    previousExp = currentExp;

    // แสดงข้อความสรุป
    const summaryElement = document.getElementById('recordSummary');
    summaryElement.innerHTML = `
        Record Summary:<br>
        • Map: ${mapName} ${mapLevel ? `(Level ${mapLevel})` : ''}<br>
        • Activities: ${activities.length > 0 ? activities.join(', ') : 'None'}<br>
        • Experience Gained: ${expGained.toLocaleString()} (${expPercentage}%)<br>
        • Current Progress: ${currentProgress}%<br>
    `;
    summaryElement.classList.remove('show');
    void summaryElement.offsetWidth; // Trigger reflow
    summaryElement.classList.add('show');

    updateAnalysis();
    updateExpHistoryChart();
}

function calculateExpPercentage(level, expGained) {
    const requiredExp = parseInt(document.getElementById('requiredExp').value) || 0;
    if (requiredExp <= 0) {
        alert('Please enter required experience for current level!');
        return 0;
    }
    // ถ้า exp ติดลบให้ถือว่าเป็น 0
    const safeExpGained = Math.max(0, expGained);
    return ((safeExpGained / requiredExp) * 100).toFixed(2);
}

function updateDisplay(expGained, expPercentage, requiredExp, mapName, activities) {
    const totalProgress = calculateTotalProgress();
    
    document.getElementById('expGained').textContent = 
        `Experience Gained: ${expGained.toLocaleString()}`;
    document.getElementById('expPercentage').textContent = 
        `${expPercentage}% of level gained`;
    
    const historyList = document.getElementById('expHistory');
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <span class="history-map-info">${mapName}: ${expGained.toLocaleString()} exp (${expPercentage}%)</span>
        <span class="history-activities">Activities: ${activities.join(', ') || 'None'}</span>
    `;
    historyList.insertBefore(listItem, historyList.firstChild);
}

function saveToLocalStorage() {
    localStorage.setItem('expHistory', JSON.stringify(expHistory));
}

// แก้ไขฟังก์ชัน loadFromLocalStorage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('expHistory');
    if (saved) {
        expHistory = JSON.parse(saved);
        
        // Reset UI elements
        document.getElementById('expHistory').innerHTML = '';
        
        // Update history list
        [...expHistory].reverse().forEach((entry) => {
            const historyList = document.getElementById('expHistory');
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="history-map-info">${entry.mapName}: ${entry.expGained.toLocaleString()} exp (${entry.percentage}%)</span>
                <span class="history-activities">Activities: ${entry.activities?.join(', ') || 'None'}</span>
            `;
            historyList.appendChild(listItem);
        });

        // Update current progress if there are entries
        if (expHistory.length > 0) {
            const lastEntry = expHistory[expHistory.length - 1];
            const currentProgress = calculateCurrentProgress(
                lastEntry.currentExp,
                lastEntry.requiredExp
            );
            
            // Update form with last entry data
            document.getElementById('currentLevel').value = lastEntry.level;
            document.getElementById('requiredExp').value = lastEntry.requiredExp;
            document.getElementById('currentExp').value = lastEntry.currentExp;
            previousExp = lastEntry.currentExp;

            // Update displays
            updateProgressDisplay(
                currentProgress,
                lastEntry.level,
                localStorage.getItem('defaultCharClass') || 'Unknown',
                localStorage.getItem('defaultCharName') || 'Unknown'
            );
            updateProgressBar(currentProgress);
        }

        // Update all charts
        if (expHistory.length > 0) {
            updateAnalysis();
            updateExpHistoryChart();
        }
    }
}

// แก้ไขฟังก์ชัน clearAllData
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        previousExp = 0;
        expHistory = [];
        
        // Clear localStorage
        localStorage.clear();
        
        // Reset all UI elements and charts
        document.getElementById('expGained').textContent = '';
        document.getElementById('expPercentage').textContent = '';
        document.getElementById('expHistory').innerHTML = '';
        document.getElementById('currentProgress').innerHTML = '';
        document.getElementById('currentLevel').value = '';
        document.getElementById('requiredExp').value = '';
        document.getElementById('currentExp').value = '';
        document.getElementById('characterName').value = '';
        document.getElementById('characterClass').value = '';
        document.getElementById('mapLevel').value = '';
        document.getElementById('mapName').value = '';
        
        // Reset progress bar
        updateProgressBar(0);
        
        // Reset all charts
        if (expHistoryChart) {
            expHistoryChart.destroy();
            initExpHistoryChart();
        }
        
        // ... existing chart resets ...
        
        // Clear summary
        const summaryElement = document.getElementById('recordSummary');
        summaryElement.innerHTML = '';
        summaryElement.classList.remove('show');
    }
}

// เพิ่มการเริ่มต้นกราฟวิเคราะห์
document.addEventListener('DOMContentLoaded', () => {
    initAnalysisCharts();
    initExpHistoryChart();
    loadDefaultValues();
    loadFromLocalStorage();
});

function initExpHistoryChart() {
    const canvas = document.querySelector('#expHistoryChart canvas');
    const ctx = canvas.getContext('2d');

    if (expHistoryChart) {
        expHistoryChart.destroy();
    }

    expHistoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Experience Gained (%)',
                    data: [],
                    backgroundColor: 'rgba(175, 96, 37, 0.6)',
                    borderColor: '#af6025',
                    borderWidth: 1,
                    yAxisID: 'y',
                    barThickness: 20,
                    order: 1
                },
                {
                    label: 'Level Progress (%)',
                    data: [],
                    type: 'line',
                    borderColor: '#e7c491',
                    borderWidth: 2,
                    yAxisID: 'y',
                    fill: false,
                    tension: 0.4,
                    order: 0
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    right: 20
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(175, 96, 37, 0.2)'
                    },
                    ticks: {
                        color: '#e7c491'
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(175, 96, 37, 0.2)'
                    },
                    ticks: {
                        color: '#e7c491',
                        padding: 10
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'y',
                intersect: false
            },
            plugins: {
                tooltip: {
                    mode: 'nearest',
                    callbacks: {
                        beforeTitle: function(tooltipItems) {
                            return 'Map Details:';
                        },
                        title: function(tooltipItems) {
                            const dataIndex = tooltipItems[0].dataIndex;
                            const entries = [...expHistory].reverse();
                            const limit = document.getElementById('historyLimit').value;
                            const limitedEntries = limit === 'all' ? entries : entries.slice(0, parseInt(limit));
                            const entry = limitedEntries[dataIndex];
                            if (!entry) return '';
                            // แก้ไขรูปแบบการแสดงชื่อแมพและเลเวล
                            return entry.mapLevel ? `${entry.mapName} (${entry.mapLevel})` : entry.mapName;
                        },
                        afterTitle: function(tooltipItems) {
                            const dataIndex = tooltipItems[0].dataIndex;
                            const entries = [...expHistory].reverse();
                            const limit = document.getElementById('historyLimit').value;
                            const limitedEntries = limit === 'all' ? entries : entries.slice(0, parseInt(limit));
                            const entry = limitedEntries[dataIndex];
                            if (!entry || !entry.activities) return '';
                            return `Activities: ${entry.activities.join(', ') || 'None'}`;
                        },
                        label: function(context) {
                            const dataIndex = context.dataIndex;
                            const entries = [...expHistory].reverse();
                            const limit = document.getElementById('historyLimit').value;
                            const limitedEntries = limit === 'all' ? entries : entries.slice(0, parseInt(limit));
                            const entry = limitedEntries[dataIndex];
                            
                            if (context.datasetIndex === 0) {  // Experience Gained bar
                                return `Experience: ${entry.expGained.toLocaleString()} (${entry.percentage}%)`;
                            } else {  // Level Progress line
                                return `Level Progress: ${context.parsed.x.toFixed(2)}%`;
                            }
                        }
                    },
                    backgroundColor: 'rgba(45, 24, 16, 0.9)',
                    titleColor: '#e7c491',
                    bodyColor: '#c7c7c7',
                    borderColor: '#af6025',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false
                },
                legend: {
                    labels: {
                        color: '#e7c491',
                        padding: 10
                    }
                }
            }
        }
    });

    // Add event listeners
    document.getElementById('historyLimit').addEventListener('change', updateExpHistoryChart);
    document.getElementById('toggleGraphBtn').addEventListener('click', toggleExpHistoryGraph);

    if (expHistory.length > 0) {
        updateExpHistoryChart();
    }
}

function updateExpHistoryChart() {
    if (!expHistoryChart) return;

    const limit = document.getElementById('historyLimit').value;
    const entries = [...expHistory].reverse();
    const limitedEntries = limit === 'all' ? entries : entries.slice(0, parseInt(limit));

    // แก้ไขรูปแบบการแสดงชื่อแมพและเลเวล
    expHistoryChart.data.labels = limitedEntries.map(entry => 
        entry.mapLevel ? `${entry.mapName} (${entry.mapLevel})` : entry.mapName
    );

    // อัพเดทข้อมูลกราฟ
    expHistoryChart.data.datasets[0].data = limitedEntries.map(entry => parseFloat(entry.percentage));
    expHistoryChart.data.datasets[1].data = limitedEntries.map(entry => 
        calculateCurrentProgress(entry.currentExp, entry.requiredExp)
    );

    // ปรับความสูงของ container ตามจำนวนข้อมูล
    const container = document.getElementById('expHistoryChart');
    const rowHeight = 30; // ความสูงต่อแถว
    const minHeight = 300; // ความสูงขั้นต่ำ
    const totalHeight = Math.max(minHeight, rowHeight * limitedEntries.length + 100); // +100 for padding and legend
    container.style.height = `${totalHeight}px`;

    expHistoryChart.update();
}

function toggleExpHistoryGraph() {
    const btn = document.getElementById('toggleGraphBtn');
    const chart = document.getElementById('expHistoryChart');
    const isHidden = chart.classList.toggle('hidden');
    btn.textContent = isHidden ? 'Show Graph' : 'Hide Graph';
}
