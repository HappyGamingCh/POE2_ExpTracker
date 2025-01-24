let previousExp = 0;
let expHistory = [];
let mapExpChart = null;
let mapFreqChart = null;
let activityExpChart = null;
let activityFreqChart = null;
let expHistoryChart = null;

// เพิ่มตัวแปร object สำหรับเก็บ URL รูปภาพของแต่ละ class
const characterImages = {
    'Acolyte': 'https://i.imgur.com/FKRmQ4t.png',
    'Blood-Mage': 'https://i.imgur.com/kT2IoGY.png',
    'Chronomancer': 'https://i.imgur.com/PLLbRlV.png',
    'Deadeye': 'https://i.imgur.com/fZHeIzf.png',
    'Gemling': 'https://i.imgur.com/FiAG2LZ.png',
    'Infernalist': 'https://i.imgur.com/lr8AKMm.png',
    'Invoker': 'https://i.imgur.com/dJCqLq5.png',
    'Pathfinder': 'https://i.imgur.com/ZV36CqA.png',
    'Stormweaver': 'https://i.imgur.com/9EUzMZI.png',
    'Titan': 'https://i.imgur.com/c6phl6C.png',
    'Warbringer': 'https://i.imgur.com/HTfc0Ap.png',
    'Witch Hunter': 'https://i.imgur.com/kqvQpdB.png'
};

// เพิ่มตาราง cumulative exp
const levelExpTable = {
    1: 0,
    2: 525,
    3: 1760,
    4: 3781,
    5: 7184,
    6: 12186,
    7: 19324,
    8: 29377,
    9: 43181,
    10: 61693,
    11: 85990,
    12: 117506,
    13: 157384,
    14: 207736,
    15: 269997,
    16: 346462,
    17: 439268,
    18: 551295,
    19: 685171,
    20: 843709,
    21: 1030734,
    22: 1249629,
    23: 1504995,
    24: 1800847,
    25: 2142652,
    26: 2535122,
    27: 2984677,
    28: 3496798,
    29: 4080655,
    30: 4742836,
    31: 5490247,
    32: 6334393,
    33: 7283446,
    34: 8348398,
    35: 9541110,
    36: 10874351,
    37: 12361842,
    38: 14018289,
    39: 15859432,
    40: 17905634,
    41: 20171471,
    42: 22679999,
    43: 25456123,
    44: 28517857,
    45: 31897771,
    46: 35621447,
    47: 39721017,
    48: 44225461,
    49: 49176560,
    50: 54607467,
    51: 60565335,
    52: 67094245,
    53: 74247659,
    54: 82075627,
    55: 90621041,
    56: 99984974,
    57: 110197515,
    58: 121340161,
    59: 133497202,
    60: 146749362,
    61: 161191120,
    62: 176922628,
    63: 194049893,
    64: 212684946,
    65: 232956711,
    66: 255001620,
    67: 278952403,
    68: 304972236,
    69: 333233648,
    70: 363906163,
    71: 397194041,
    72: 433312945,
    73: 472476370,
    74: 514937180,
    75: 560961898,
    76: 610815862,
    77: 664824416,
    78: 723298169,
    79: 786612664,
    80: 855129128,
    81: 929261318,
    82: 1009443795,
    83: 1096169525,
    84: 1189918242,
    85: 1291270350,
    86: 1400795257,
    87: 1519130326,
    88: 1646943474,
    89: 1784937926,
    90: 1934009687,
    91: 2094900291,
    92: 2268549086,
    93: 2455921256,
    94: 2658074992,
    95: 2876116501,
    96: 3111280304,
    97: 3364828162,
    98: 3638186694,
    99: 3932818530,
    100: 4250334444
};

// Modify saveDefaultValues function
function saveDefaultValues(level, currentExp, name, charClass, mapName, waystoneLevel) {
    localStorage.setItem('defaultLevel', level);
    localStorage.setItem('defaultCurrentExp', currentExp);
    localStorage.setItem('defaultCharName', name);
    localStorage.setItem('defaultCharClass', charClass);
    localStorage.setItem('defaultMapName', mapName);
    localStorage.setItem('defaultWaystoneLevel', waystoneLevel);
}

// Modify loadDefaultValues function
function loadDefaultValues() {
    const defaultLevel = localStorage.getItem('defaultLevel');
    const defaultCurrentExp = localStorage.getItem('defaultCurrentExp');
    const defaultCharName = localStorage.getItem('defaultCharName');
    const defaultCharClass = localStorage.getItem('defaultCharClass');
    const defaultMapName = localStorage.getItem('defaultMapName');
    const defaultWaystoneLevel = localStorage.getItem('defaultWaystoneLevel');
    
    if (defaultLevel) document.getElementById('currentLevel').value = defaultLevel;
    if (defaultCurrentExp) document.getElementById('currentExp').value = defaultCurrentExp;
    if (defaultCharName) document.getElementById('characterName').value = defaultCharName;
    if (defaultCharClass) document.getElementById('characterClass').value = defaultCharClass;
    if (defaultMapName) document.getElementById('mapName').value = defaultMapName;
    if (defaultWaystoneLevel) document.getElementById('waystoneLevel').value = defaultWaystoneLevel;
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
                borderWidth: 0
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
        },
        plugins: [{
            id: 'centerText',
            beforeDraw: function(chart) {
                if (chart.config.data.totalCount) {
                    const ctx = chart.ctx;
                    const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
                    const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;

                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    // แสดงจำนวนรวม
                    ctx.font = 'bold 30px Fontin';
                    ctx.fillStyle = '#e7c491';
                    ctx.fillText(chart.config.data.totalCount.toString(), centerX, centerY - 10);

                    // แสดงคำว่า "RUNS" หรือ "TIMES"
                    ctx.font = '12px Fontin';
                    ctx.fillStyle = '#af6025';
                    ctx.fillText(chart.config.data.isMap ? 'RUNS' : 'TIMES', centerX, centerY + 10);

                    ctx.restore();
                }
            }
        }]
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
    updateAnalysisCharts(mapExpChart, mapFreqChart, mapStats, true);
    
    // อัพเดทกราฟ Activity
    updateAnalysisCharts(activityExpChart, activityFreqChart, activityStats, false);
}

/* ...existing code... */

function updateAnalysisCharts(expChart, freqChart, stats, isMap = true) {
    // Sort data by average percentage from highest to lowest for bar chart
    const sortedForBarChart = Object.entries(stats).sort((a, b) => {
        const avgA = a[1].total / a[1].count;
        const avgB = b[1].total / b[1].count;
        return avgB - avgA;  // Sort descending
    });

    // Sort data by count from highest to lowest for doughnut chart
    const sortedForDoughnut = Object.entries(stats).sort((a, b) => {
        return b[1].count - a[1].count;  // Sort descending
    });

    // Update bar chart
    expChart.data.labels = sortedForBarChart.map(([key]) => key);
    expChart.data.datasets[0].data = sortedForBarChart.map(([_, value]) => 
        (value.total / value.count).toFixed(2)
    );
    expChart.update();

    // Calculate total count
    const totalCount = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);
    
    // Update doughnut chart
    freqChart.data.labels = sortedForDoughnut.map(([key]) => key);
    freqChart.data.datasets[0].data = sortedForDoughnut.map(([_, value]) => value.count);
    freqChart.data.totalCount = totalCount;
    freqChart.data.isMap = isMap; // เพิ่มตัวแปรเพื่อแยกระหว่าง map และ activity
    freqChart.update();
}

/* ...existing code... */

function calculateTotalProgress() {
    if (expHistory.length === 0) return 0;
    
    const currentLevel = parseInt(document.getElementById('currentLevel').value);
    const currentLevelExp = levelExpTable[currentLevel] || 0;
    const nextLevelExp = levelExpTable[currentLevel + 1] || 0;
    
    if (!nextLevelExp) return 100;
    
    const requiredExp = nextLevelExp - currentLevelExp;
    // แปลง totalExp เป็นหน่วยล้าน
    const totalExp = expHistory.reduce((sum, entry) => sum + (parseFloat(entry.expGained) * 1000000), 0);
    return ((totalExp / requiredExp) * 100).toFixed(2);
}

// แก้ไขฟังก์ชัน calculateCurrentProgress
function calculateCurrentProgress(currentLevel, totalExp) {
    const currentLevelExp = levelExpTable[currentLevel] || 0;
    const nextLevelExp = levelExpTable[currentLevel + 1] || 0;
    
    if (!nextLevelExp) return 100;
    
    const requiredExp = nextLevelExp - currentLevelExp;
    // แปลง totalExp เป็นหน่วยล้าน เพราะ input เป็นหน่วยล้าน
    const totalExpInMillions = parseFloat(totalExp) * 1000000;
    const expInCurrentLevel = totalExpInMillions - currentLevelExp;
    
    return Math.min(Math.max(((expInCurrentLevel / requiredExp) * 100), 0), 100).toFixed(2);
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
    const characterImage = characterImages[charClass] || '';
    
    const detailsHTML = `
        <div class="current-progress-details">
            <div class="character-info">
                <span>${charName}</span>
                <span>Class: ${charClass}</span>
                <span>Level: ${level}</span>
            </div>
            ${characterImage ? `
                <div class="character-portrait">
                    <img src="${characterImage}" alt="${charClass} portrait">
                </div>
            ` : ''}
        </div>
    `;
    
    progressElement.innerHTML = detailsHTML;
}

// แก้ไขฟังก์ชัน recordExperience
function recordExperience() {
    const totalExp = parseFloat(document.getElementById('currentExp').value);
    const currentLevel = calculateLevelFromExp(totalExp); // ใช้ฟังก์ชันใหม่แทน
    const mapName = document.getElementById('mapName').value;
    const activities = getSelectedActivities();
    const charName = document.getElementById('characterName').value;
    const charClass = document.getElementById('characterClass').value;

    if (!totalExp || !mapName) {
        alert('Please fill all required fields (marked with *)');
        return;
    }

    if (previousExp === 0) {
        previousExp = totalExp;
        return;
    }

    // คำนวณ exp gained
    const expGained = Math.max(0, (totalExp - previousExp)).toFixed(2);
    
    // คำนวณ percentage จาก exp gained เทียบกับ exp ที่ต้องการในเลเวลปัจจุบัน
    const expPercentage = calculateExpPercentage(currentLevel, expGained);
    
    // คำนวณ current progress
    const currentProgress = calculateCurrentProgress(currentLevel, totalExp);

    expHistory.push({
        level: currentLevel,
        expGained: expGained,
        percentage: expPercentage,
        totalExp: totalExp,
        mapName: mapName,
        mapLevel: calculateMapLevel(),
        activities: activities,
        timestamp: new Date().getTime()
    });

    // Save default values
    saveDefaultValues(
        currentLevel, 
        totalExp,
        charName, 
        charClass,
        mapName,
        document.getElementById('waystoneLevel').value
    );

    // Update displays
    updateProgressDisplay(currentProgress, currentLevel, charClass, charName);
    updateProgressBar(currentProgress);
    updateDisplay(expGained, expPercentage, levelExpTable[currentLevel + 1] - levelExpTable[currentLevel], mapName, activities);
    saveToLocalStorage();
    previousExp = totalExp;

    // แสดงข้อความสรุป
    const summaryElement = document.getElementById('recordSummary');
    summaryElement.innerHTML = `
        Record Summary:<br>
        • Map: ${mapName} ${calculateMapLevel() ? `(Level ${calculateMapLevel()})` : ''}<br>
        • Activities: ${activities.length > 0 ? activities.join(', ') : 'None'}<br>
        • Experience Gained: ${Number(expGained).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} millions (${expPercentage}%)<br>
        • Current Progress: ${currentProgress}%<br>
    `;
    summaryElement.classList.remove('show');
    void summaryElement.offsetWidth;
    summaryElement.classList.add('show');

    updateAnalysis();
    updateExpHistoryChart();
    updateAnalysisSummary();
}

// แก้ไขฟังก์ชัน calculateExpPercentage
function calculateExpPercentage(currentLevel, expGained) {
    const currentLevelExp = levelExpTable[currentLevel] || 0;
    const nextLevelExp = levelExpTable[currentLevel + 1] || 0;
    
    if (!nextLevelExp) return 0;
    
    const requiredExp = nextLevelExp - currentLevelExp;
    // แปลง expGained เป็นหน่วยล้าน (เพราะ input เป็นหน่วยล้าน)
    const expGainedInMillions = parseFloat(expGained) * 1000000;
    return ((expGainedInMillions / requiredExp) * 100).toFixed(2);
}

function updateDisplay(expGained, expPercentage, requiredExp, mapName, activities) {
    const totalProgress = calculateTotalProgress();
    const mapLevel = calculateMapLevel();
    
    const historyList = document.getElementById('expHistory');
    const listItem = document.createElement('li');
    listItem.innerHTML = `
        <span class="history-map-info">${mapName} (${mapLevel}): ${Number(expGained).toLocaleString(undefined, {maximumFractionDigits: 2})} millions (${expPercentage}%)</span>
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
                <span class="history-map-info">${entry.mapName} (${entry.mapLevel}): ${Number(entry.expGained).toLocaleString(undefined, {maximumFractionDigits: 2})} millions (${entry.percentage}%)</span>
                <span class="history-activities">Activities: ${entry.activities?.join(', ') || 'None'}</span>
            `;
            historyList.appendChild(listItem);
        });

        // Update current progress if there are entries
        if (expHistory.length > 0) {
            const lastEntry = expHistory[expHistory.length - 1];
            document.getElementById('currentExp').value = lastEntry.totalExp;
            previousExp = parseFloat(lastEntry.totalExp);
            
            // Update level info
            updateLevelInfo();

            // Update displays
            updateProgressDisplay(
                calculateCurrentProgress(
                    lastEntry.level,
                    parseFloat(lastEntry.totalExp)
                ),
                lastEntry.level,
                localStorage.getItem('defaultCharClass') || 'Unknown',
                localStorage.getItem('defaultCharName') || 'Unknown'
            );
            updateProgressBar(calculateCurrentProgress(
                lastEntry.level,
                parseFloat(lastEntry.totalExp)
            ));
        }

        // Update all charts
        if (expHistory.length > 0) {
            updateAnalysis();
            updateExpHistoryChart();
        }
    }
}

// Modify clearAllData function
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        // Clear all data first
        previousExp = 0;
        expHistory = [];
        localStorage.clear();
        
        // Force save empty state
        saveToLocalStorage();
        
        // Use setTimeout to ensure the page refreshes after data is cleared
        setTimeout(() => {
            window.location.href = window.location.href;
        }, 100);
    }
}

// เพิ่มการเริ่มต้นกราฟวิเคราะห์
document.addEventListener('DOMContentLoaded', () => {
    initAnalysisCharts();
    initExpHistoryChart();
    loadDefaultValues();
    loadFromLocalStorage();
    updateAnalysisSummary();
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
                    label: 'Experience Gained',
                    data: [],
                    backgroundColor: 'rgba(175, 96, 37, 0.6)',
                    borderColor: '#af6025',
                    borderWidth: 1,
                    yAxisID: 'y',
                    xAxisID: 'x2',
                    barThickness: 20,
                    order: 1
                },
                {
                    label: 'Level Progress',
                    data: [],
                    type: 'line',
                    borderColor: '#e7c491',
                    borderWidth: 2,
                    yAxisID: 'y',
                    xAxisID: 'x',
                    fill: false,
                    tension: 0,
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
                    right: 50
                }
            },
            scales: {
                x: {
                    position: 'top',
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(175, 96, 37, 0.2)'
                    },
                    ticks: {
                        color: '#e7c491'
                    },
                    title: {
                        display: true,
                        text: 'Level Progress (%)',
                        color: '#e7c491',
                        font: {
                            size: 12
                        }
                    }
                },
                x2: {
                    position: 'bottom',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: '#e7c491',
                        callback: function(value) {
                            return value + ' millions';
                        }
                    },
                    title: {
                        display: true,
                        text: 'Experience Gained (millions)',
                        color: '#e7c491',
                        font: {
                            size: 12
                        }
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
                                return `Experience: ${Number(entry.expGained).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} millions`;
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

    expHistoryChart.data.labels = limitedEntries.map(entry => 
        entry.mapLevel ? `${entry.mapName} (${entry.mapLevel})` : entry.mapName
    );

    // Update data for both datasets
    expHistoryChart.data.datasets[0].data = limitedEntries.map(entry => parseFloat(entry.expGained));
    expHistoryChart.data.datasets[1].data = limitedEntries.map(entry => 
        calculateCurrentProgress(entry.level, parseFloat(entry.totalExp))
    );

    // Find max experience gained for x2 axis
    const maxExp = Math.max(...limitedEntries.map(entry => parseFloat(entry.expGained)));
    expHistoryChart.options.scales.x2.max = Math.ceil(maxExp * 1.1); // Add 10% padding

    // Update container height
    const container = document.getElementById('expHistoryChart');
    const rowHeight = 30;
    const minHeight = 300;
    const totalHeight = Math.max(minHeight, rowHeight * limitedEntries.length + 100);
    container.style.height = `${totalHeight}px`;

    expHistoryChart.update();
}

function toggleExpHistoryGraph() {
    const btn = document.getElementById('toggleGraphBtn');
    const chart = document.getElementById('expHistoryChart');
    const isHidden = chart.classList.toggle('hidden');
    btn.textContent = isHidden ? 'Show Graph' : 'Hide Graph';
}

function updateAnalysisSummary() {
    const avgExpData = calculateAverageExpPerMap();
    const mapsToLevel = calculateMapsToNextLevel();
    
    document.getElementById('avgExpPerMap').textContent = 
        avgExpData.exp > 0 ? 
        `${avgExpData.exp} millions (${avgExpData.percentage}%)` : 
        '0 millions (0%)';
    
    document.getElementById('mapsToLevel').textContent = 
        mapsToLevel !== '-' ? `${mapsToLevel} maps` : '-';

    // อัพเดท Best Maps
    const bestMaps = findBestMapsForExp();
    document.getElementById('bestMaps').innerHTML = bestMaps.length > 0 ?
        bestMaps.map(map => `${map.name} (${map.avgPercentage}%)`).join('<br>') :
        '-';

    // อัพเดท Best Activities
    const bestActivities = findBestActivitiesForExp();
    document.getElementById('bestActivities').innerHTML = bestActivities.length > 0 ?
        bestActivities.map(activity => `${activity.name} (${activity.avgPercentage}%)`).join('<br>') :
        '-';
}

async function loadImageAsBase64(url) {
    try {
        // ใช้ proxy service เพื่อหลีกเลี่ยง CORS
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const response = await fetch(proxyUrl + url);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error loading image:', error);
        return null;
    }
}

async function shareAnalysis() {
    try {
        const container = document.createElement('div');
        const charClass = document.getElementById('characterClass').value;
        
        // เพิ่มความกว้างเป็น 500px
        container.style.cssText = `
            background: linear-gradient(135deg, #1a1410 0%, #2d1810 100%);
            width: 500px;
            padding: 20px;
            font-family: 'Fontin', 'Noto Sans', Arial, sans-serif;
            position: fixed;
            left: -9999px;
            top: -9999px;
            box-sizing: border-box;
        `;

        // คำนวณ total counts
        const mapStats = {};
        const activityStats = {};
        expHistory.forEach(entry => {
            mapStats[entry.mapName] = (mapStats[entry.mapName] || 0) + 1;
            entry.activities.forEach(activity => {
                activityStats[activity] = (activityStats[activity] || 0) + 1;
            });
        });

        const totalMaps = Object.values(mapStats).reduce((sum, count) => sum + count, 0);
        const totalActivities = Object.values(activityStats).reduce((sum, count) => sum + count, 0);
        const currentProgress = calculateCurrentProgress(
            parseInt(document.getElementById('currentLevel').value),
            parseFloat(document.getElementById('currentExp').value)
        );

        container.innerHTML = `
            <div style="
                border: 2px solid #af6025;
                border-radius: 8px;
                padding: 20px;
                background: linear-gradient(160deg, rgba(45, 24, 16, 0.4) 0%, rgba(26, 20, 16, 0.4) 100%);
                box-shadow: 0 0 20px rgba(175, 96, 37, 0.1);
            ">
                <div style="
                    text-align: center;
                    margin-bottom: 20px;
                    padding: 20px;
                    background: rgba(45, 24, 16, 0.6);
                    border-radius: 6px;
                    border: 1px solid rgba(175, 96, 37, 0.3);
                ">
                    <div style="color: #af6025; font-size: 16px;">
                        <div style="margin-bottom: 10px;">Name: <span style="color: #e7c491;">${document.getElementById('characterName').value}</span></div>
                        <div style="margin-bottom: 10px;">Class: <span style="color: #e7c491;">${charClass}</span></div>
                        <div>Level: <span style="color: #e7c491;">${document.getElementById('currentLevel').value} (${currentProgress}%)</span></div>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 15px;">
                    <!-- Most Played Section -->
                    <div style="
                        border: 1px solid rgba(175, 96, 37, 0.4);
                        border-radius: 6px;
                        padding: 15px;
                        background: rgba(45, 24, 16, 0.6);
                    ">
                        <h3 style="
                            color: #e7c491;
                            margin: 0 0 15px 0;
                            font-size: 16px;
                            text-align: center;
                        ">Most Played</h3>
                        <div style="display: flex; justify-content: space-between;">
                            <div style="flex: 1;">
                                <h4 style="color: #af6025; margin: 0 0 10px 0; font-size: 14px;">Maps (Total: ${totalMaps} runs)</h4>
                                ${findMostPlayedMaps().map((map, index) => `
                                    <p style="
                                        margin: 5px 0;
                                        color: #e7c491;
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                        font-size: 14px;
                                    ">
                                        <span style="font-size: 16px;">${['🥇', '🥈', '🥉'][index]}</span>
                                        ${map.name} <span style="color: #af6025;">(${map.count})</span>
                                    </p>
                                `).join('')}
                            </div>
                            <div style="flex: 1;">
                                <h4 style="color: #af6025; margin: 0 0 10px 0; font-size: 14px;">Activities (Total: ${totalActivities} times)</h4>
                                ${findMostPlayedActivities().map((activity, index) => `
                                    <p style="
                                        margin: 5px 0;
                                        color: #e7c491;
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                        font-size: 14px;
                                    ">
                                        <span style="font-size: 16px;">${['🥇', '🥈', '🥉'][index]}</span>
                                        ${activity.name} <span style="color: #af6025;">(${activity.count})</span>
                                    </p>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- Best Farming Section -->
                    <div style="
                        border: 1px solid rgba(175, 96, 37, 0.4);
                        border-radius: 6px;
                        padding: 15px;
                        background: rgba(45, 24, 16, 0.6);
                    ">
                        <h3 style="
                            color: #e7c491;
                            margin: 0 0 15px 0;
                            font-size: 16px;
                            text-align: center;
                        ">Best Farming</h3>
                        <div style="display: flex; justify-content: space-between;">
                            <div style="flex: 1;">
                                <h4 style="color: #af6025; margin: 0 0 10px 0; font-size: 14px;">Maps:</h4>
                                ${findBestMapsForExp().map((map, index) => `
                                    <p style="
                                        margin: 5px 0;
                                        color: #e7c491;
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                        font-size: 14px;
                                    ">
                                        <span style="font-size: 16px;">${['🥇', '🥈', '🥉'][index]}</span>
                                        ${map.name} <span style="color: #af6025;">(${map.avgPercentage}%)</span>
                                    </p>
                                `).join('')}
                            </div>
                            <div style="flex: 1;">
                                <h4 style="color: #af6025; margin: 0 0 10px 0; font-size: 14px;">Activities:</h4>
                                ${findBestActivitiesForExp().map((activity, index) => `
                                    <p style="
                                        margin: 5px 0;
                                        color: #e7c491;
                                        display: flex;
                                        align-items: center;
                                        gap: 8px;
                                        font-size: 14px;
                                    ">
                                        <span style="font-size: 16px;">${['🥇', '🥈', '🥉'][index]}</span>
                                        ${activity.name} <span style="color: #af6025;">(${activity.avgPercentage}%)</span>
                                    </p>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <div style="
                    text-align: center;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 1px solid rgba(175, 96, 37, 0.3);
                ">
                    <p style="
                        color: #af6025;
                        margin: 0;
                        font-size: 12px;
                        opacity: 0.8;
                    ">Created with PoE2 EXP Tracker</p>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        try {
            const canvas = await html2canvas(container, {
                backgroundColor: '#1a1410',
                scale: 2,
                logging: false,
                width: 500, // ปรับความกว้างให้ตรงกับ container
                height: container.offsetHeight
            });

            const modal = document.getElementById('shareModal');
            const shareImage = document.getElementById('shareImage');
            shareImage.src = canvas.toDataURL('image/png');
            modal.classList.add('active');
        } finally {
            document.body.removeChild(container);
        }
    } catch (error) {
        console.error('Failed to create image:', error);
        alert('Failed to create shareable image. Please try again.');
    }
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    modal.classList.remove('active');
}

// ปิด modal เมื่อคลิกพื้นที่นอก modal content
document.getElementById('shareModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeShareModal();
    }
});

// เพิ่มฟังก์ชันสำหรับคำนวณค่าเฉลี่ย EXP ต่อ map
function calculateAverageExpPerMap() {
    if (expHistory.length === 0) return { exp: 0, percentage: 0 };
    
    const totalExp = expHistory.reduce((sum, entry) => sum + parseFloat(entry.expGained), 0);
    const totalPercentage = expHistory.reduce((sum, entry) => sum + parseFloat(entry.percentage), 0);
    
    return {
        exp: (totalExp / expHistory.length).toFixed(2),
        percentage: (totalPercentage / expHistory.length).toFixed(2)
    };
}

// เพิ่มฟังก์ชันหา maps ที่ให้ exp ดีที่สุด
function findBestMapsForExp() {
    const mapStats = {};
    expHistory.forEach(entry => {
        if (!mapStats[entry.mapName]) {
            mapStats[entry.mapName] = {
                totalPercentage: 0,
                count: 0
            };
        }
        mapStats[entry.mapName].totalPercentage += parseFloat(entry.percentage);
        mapStats[entry.mapName].count++;
    });

    return Object.entries(mapStats)
        .map(([name, stats]) => ({
            name,
            avgPercentage: (stats.totalPercentage / stats.count).toFixed(2)
        }))
        .sort((a, b) => parseFloat(b.avgPercentage) - parseFloat(a.avgPercentage))
        .slice(0, 3);
}

// เพิ่มฟังก์ชันหา activities ที่ให้ exp ดีที่สุด
function findBestActivitiesForExp() {
    const activityStats = {};
    expHistory.forEach(entry => {
        entry.activities.forEach(activity => {
            if (!activityStats[activity]) {
                activityStats[activity] = {
                    totalPercentage: 0,
                    count: 0
                };
            }
            activityStats[activity].totalPercentage += parseFloat(entry.percentage);
            activityStats[activity].count++;
        });
    });

    return Object.entries(activityStats)
        .map(([name, stats]) => ({
            name,
            avgPercentage: (stats.totalPercentage / stats.count).toFixed(2)
        }))
        .sort((a, b) => parseFloat(b.avgPercentage) - parseFloat(a.avgPercentage))
        .slice(0, 3);
}

// แก้ไขฟังก์ชัน calculateMapsToNextLevel
function calculateMapsToNextLevel() {
    const currentLevel = parseInt(document.getElementById('currentLevel').value);
    const currentExp = parseFloat(document.getElementById('currentExp').value);
    const avgExpPerMap = parseFloat(calculateAverageExpPerMap().exp);
    
    if (!avgExpPerMap || !currentExp || !currentLevel) return '-';
    
    const currentLevelExp = levelExpTable[currentLevel] || 0;
    const nextLevelExp = levelExpTable[currentLevel + 1] || 0;
    
    if (!nextLevelExp) return '-';
    
    // คำนวณ exp ที่ต้องการถึง level ถัดไป (หน่วยล้าน)
    const remainingExp = ((nextLevelExp - (currentExp * 1000000)) / 1000000);
    
    return Math.ceil(remainingExp / avgExpPerMap);
}

// เพิ่มฟังก์ชันใหม่สำหรับหา most played maps และ activities
function findMostPlayedMaps() {
    const mapStats = {};
    expHistory.forEach(entry => {
        mapStats[entry.mapName] = (mapStats[entry.mapName] || 0) + 1;
    });

    return Object.entries(mapStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
}

function findMostPlayedActivities() {
    const activityStats = {};
    expHistory.forEach(entry => {
        entry.activities.forEach(activity => {
            activityStats[activity] = (activityStats[activity] || 0) + 1;
        });
    });

    return Object.entries(activityStats)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
}

// แก้ไขฟังก์ชัน filterMaps
function filterMaps() {
    const checkedTypes = Array.from(document.querySelectorAll('input[name="mapType"]:checked'))
        .map(cb => cb.value);
    const mapSelect = document.getElementById('mapName');
    const options = mapSelect.getElementsByTagName('option');

    for (let option of options) {
        const type = option.getAttribute('data-type');
        if (checkedTypes.includes(type)) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    }

    // ถ้า selected option ถูก hide ให้เลือก option แรกที่แสดงอยู่แทน
    if (mapSelect.selectedOptions[0].style.display === 'none') {
        for (let option of options) {
            if (option.style.display !== 'none') {
                mapSelect.value = option.value;
                break;
            }
        }
    }
}

// เพิ่ม event listener สำหรับ checkbox
document.querySelectorAll('input[name="mapType"]').forEach(checkbox => {
    checkbox.addEventListener('change', filterMaps);
});

// Add this new function
function calculateMapLevel() {
    const waystoneLevel = parseInt(document.getElementById('waystoneLevel').value);
    const activities = getSelectedActivities();
    
    let mapLevel = waystoneLevel + 64;
    
    if (activities.includes('Irradiated')) {
        mapLevel += 1;
    }
    
    if (activities.includes('Corruption')) {
        mapLevel += 1;
    }
    
    return mapLevel;
}

// เพิ่มฟังก์ชันใหม่สำหรับคำนวณ level จาก exp
function calculateLevelFromExp(totalExp) {
    // แปลง exp จากหน่วยล้านเป็นหน่วยปกติ
    const expInNormal = totalExp * 1000000;
    
    // หา level จากตาราง
    for (let level = 100; level >= 1; level--) {
        if (expInNormal >= levelExpTable[level]) {
            return level;
        }
    }
    return 1;
}

// แก้ไขฟังก์ชันสำหรับอัพเดท level และ next level exp
function updateLevelInfo() {
    const currentExp = parseFloat(document.getElementById('currentExp').value);
    if (!currentExp) return;

    const level = calculateLevelFromExp(currentExp);
    document.getElementById('currentLevel').value = level;

    const nextLevelExp = Math.round((levelExpTable[level + 1] || levelExpTable[level]) / 1000000);
    document.getElementById('nextLevelExp').value = nextLevelExp.toLocaleString() + ' millions';
}

// แก้ไข event listener สำหรับ current exp input
document.getElementById('currentExp').addEventListener('input', updateLevelInfo);
