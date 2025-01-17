let previousExp = 0;
let expHistory = [];
let mapExpChart = null;
let mapFreqChart = null;
let activityExpChart = null;
let activityFreqChart = null;
let expHistoryChart = null;

// เพิ่มตัวแปร object สำหรับเก็บ URL รูปภาพของแต่ละ class
const characterImages = {
    'Witch Hunter': 'https://img.game8.co/4052791/ebef870a91cef16c9d900c81d8f243e5.png/show',
    'Invoker': 'https://img.game8.co/4052796/579ad47527c6654fe07091ed110a0ed2.png/show',
    // เพิ่ม class อื่นๆ ตามต้องการ
};

// เพิ่มฟังก์ชันสำหรับจัดการค่า default
function saveDefaultValues(level, requiredExp, currentExp, name, charClass, mapName, mapLevel) {
    localStorage.setItem('defaultLevel', level);
    localStorage.setItem('defaultRequiredExp', requiredExp);
    localStorage.setItem('defaultCurrentExp', currentExp);
    localStorage.setItem('defaultCharName', name);
    localStorage.setItem('defaultCharClass', charClass);
    localStorage.setItem('defaultMapName', mapName);
    localStorage.setItem('defaultMapLevel', mapLevel);
}

function loadDefaultValues() {
    const defaultLevel = localStorage.getItem('defaultLevel');
    const defaultRequiredExp = localStorage.getItem('defaultRequiredExp');
    const defaultCurrentExp = localStorage.getItem('defaultCurrentExp');
    const defaultCharName = localStorage.getItem('defaultCharName');
    const defaultCharClass = localStorage.getItem('defaultCharClass');
    const defaultMapName = localStorage.getItem('defaultMapName');
    const defaultMapLevel = localStorage.getItem('defaultMapLevel');
    
    if (defaultLevel) document.getElementById('currentLevel').value = defaultLevel;
    if (defaultRequiredExp) document.getElementById('requiredExp').value = defaultRequiredExp;
    if (defaultCurrentExp) document.getElementById('currentExp').value = defaultCurrentExp;
    if (defaultCharName) document.getElementById('characterName').value = defaultCharName;
    if (defaultCharClass) document.getElementById('characterClass').value = defaultCharClass;
    if (defaultMapName) document.getElementById('mapName').value = defaultMapName;
    if (defaultMapLevel) document.getElementById('mapLevel').value = defaultMapLevel;
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
    // เรียงข้อมูลตามค่าเฉลี่ยจากมากไปน้อยสำหรับกราฟแท่ง
    const sortedForBarChart = Object.entries(stats).sort((a, b) => {
        const avgA = a[1].total / a[1].count;
        const avgB = b[1].total / b[1].count;
        return avgB - avgA;
    });

    // เรียงข้อมูลตามความถี่จากน้อยไปมากสำหรับกราฟโดนัท
    const sortedForDoughnut = Object.entries(stats).sort((a, b) => {
        return a[1].count - b[1].count;
    });

    // อัพเดทกราฟแท่ง
    expChart.data.labels = sortedForBarChart.map(([key]) => key);
    expChart.data.datasets[0].data = sortedForBarChart.map(([_, value]) => 
        (value.total / value.count).toFixed(2)
    );
    expChart.update();

    // คำนวณ total count
    const totalCount = Object.values(stats).reduce((sum, stat) => sum + stat.count, 0);
    
    // อัพเดทกราฟโดนัท
    freqChart.data.labels = sortedForDoughnut.map(([key]) => key);
    freqChart.data.datasets[0].data = sortedForDoughnut.map(([_, value]) => value.count);
    freqChart.data.totalCount = totalCount;
    freqChart.data.isMap = isMap; // เพิ่มตัวแปรเพื่อแยกระหว่าง map และ activity
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
    return ((parseFloat(currentExp) / parseFloat(requiredExp)) * 100).toFixed(2);
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
    const currentLevel = document.getElementById('currentLevel').value;
    const currentExp = parseFloat(document.getElementById('currentExp').value).toFixed(2);
    const requiredExp = parseFloat(document.getElementById('requiredExp').value).toFixed(2);
    const mapName = document.getElementById('mapName').value;
    const mapLevel = document.getElementById('mapLevel').value;
    const activities = getSelectedActivities();
    const charName = document.getElementById('characterName').value;
    const charClass = document.getElementById('characterClass').value;

    if (!requiredExp || currentExp === undefined || !mapName) {
        alert('Please fill all required fields (marked with *)');
        return;
    }

    if (previousExp === 0) {
        previousExp = parseFloat(currentExp);
        return;
    }

    // คำนวณ exp gained โดยไม่ปัดทศนิยม
    const expGained = Math.max(0, (parseFloat(currentExp) - previousExp)).toFixed(2);
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

    // Save default values with current exp and map details
    saveDefaultValues(
        currentLevel, 
        requiredExp, 
        currentExp, 
        charName, 
        charClass,
        mapName,
        mapLevel
    );

    // Update current progress display and progress bar
    updateProgressDisplay(currentProgress, currentLevel, charClass, charName);
    updateProgressBar(currentProgress);

    updateDisplay(expGained, expPercentage, requiredExp, mapName, activities);
    saveToLocalStorage();
    previousExp = parseFloat(currentExp);

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
    updateAnalysisSummary();
}

function calculateExpPercentage(level, expGained) {
    const requiredExp = parseFloat(document.getElementById('requiredExp').value) || 0;
    if (requiredExp <= 0) {
        alert('Please enter required experience for current level!');
        return 0;
    }
    return ((parseFloat(expGained) / requiredExp) * 100).toFixed(2);
}

function updateDisplay(expGained, expPercentage, requiredExp, mapName, activities) {
    const totalProgress = calculateTotalProgress();
    
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
            previousExp = parseFloat(lastEntry.currentExp);

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
        
        // Reset all UI elements
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
        
        if (mapExpChart) {
            mapExpChart.destroy();
            mapExpChart = new Chart(
                document.getElementById('mapExpAnalysisChart'),
                createBarChartConfig()
            );
        }
        
        if (mapFreqChart) {
            mapFreqChart.destroy();
            mapFreqChart = new Chart(
                document.getElementById('mapFreqAnalysisChart'),
                createDoughnutChartConfig()
            );
        }
        
        if (activityExpChart) {
            activityExpChart.destroy();
            activityExpChart = new Chart(
                document.getElementById('activityExpAnalysisChart'),
                createBarChartConfig()
            );
        }
        
        if (activityFreqChart) {
            activityFreqChart.destroy();
            activityFreqChart = new Chart(
                document.getElementById('activityFreqAnalysisChart'),
                createDoughnutChartConfig()
            );
        }

        // Reset analysis summary
        document.getElementById('avgExpPerMap').textContent = '-';
        document.getElementById('mapsToLevel').textContent = '-';
        document.getElementById('bestMaps').innerHTML = '-';
        document.getElementById('bestActivities').innerHTML = '-';
        
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
                    tension: 0, // Changed from 0.4 to 0 for straight lines
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

function updateAnalysisSummary() {
    const avgExpData = calculateAverageExpPerMap();
    const mapsToLevel = calculateMapsToNextLevel();
    
    document.getElementById('avgExpPerMap').textContent = 
        avgExpData.exp > 0 ? 
        `${avgExpData.exp} exp (${avgExpData.percentage}%)` : 
        '0 exp (0%)';
    
    document.getElementById('mapsToLevel').textContent = 
        mapsToLevel !== '-' ? `${mapsToLevel} maps` : '0 maps';

    // อัพเดท Best Maps
    const bestMaps = findBestMapsForExp();
    document.getElementById('bestMaps').innerHTML = bestMaps
        .map(map => `${map.name} (${map.avgPercentage}%)`)
        .join('<br>');

    // อัพเดท Best Activities
    const bestActivities = findBestActivitiesForExp();
    document.getElementById('bestActivities').innerHTML = bestActivities
        .map(activity => `${activity.name} (${activity.avgPercentage}%)`)
        .join('<br>');
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
            parseFloat(document.getElementById('currentExp').value),
            parseFloat(document.getElementById('requiredExp').value)
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

// ลบฟังก์ชัน exportToPNG เดิมออก

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
                totalExp: 0,
                totalPercentage: 0,
                count: 0
            };
        }
        mapStats[entry.mapName].totalExp += parseFloat(entry.expGained);
        mapStats[entry.mapName].totalPercentage += parseFloat(entry.percentage);
        mapStats[entry.mapName].count++;
    });

    return Object.entries(mapStats)
        .map(([name, stats]) => ({
            name,
            exp: Math.round(stats.totalExp / stats.count),
            avgPercentage: (stats.totalPercentage / stats.count).toFixed(2)
        }))
        .sort((a, b) => parseFloat(b.avgPercentage) - parseFloat(a.avgPercentage))  // เรียงจากมากไปน้อย
        .slice(0, 3);
}

// เพิ่มฟังก์ชันหา activities ที่ให้ exp ดีที่สุด
function findBestActivitiesForExp() {
    const activityStats = {};
    expHistory.forEach(entry => {
        entry.activities.forEach(activity => {
            if (!activityStats[activity]) {
                activityStats[activity] = {
                    totalExp: 0,
                    totalPercentage: 0,
                    count: 0
                };
            }
            activityStats[activity].totalExp += parseFloat(entry.expGained);
            activityStats[activity].totalPercentage += parseFloat(entry.percentage);
            activityStats[activity].count++;
        });
    });

    return Object.entries(activityStats)
        .map(([name, stats]) => ({
            name,
            exp: Math.round(stats.totalExp / stats.count),
            avgPercentage: (stats.totalPercentage / stats.count).toFixed(2)
        }))
        .sort((a, b) => parseFloat(b.avgPercentage) - parseFloat(a.avgPercentage))  // เรียงจากมากไปน้อย
        .slice(0, 3);
}

// เพิ่มฟังก์ชันคำนวณจำนวน maps ที่ต้องเล่นถึง level ถัดไป
function calculateMapsToNextLevel() {
    const currentExp = parseFloat(document.getElementById('currentExp').value);
    const requiredExp = parseFloat(document.getElementById('requiredExp').value);
    const avgExpPerMap = parseFloat(calculateAverageExpPerMap().exp);
    
    if (!avgExpPerMap || !requiredExp || currentExp === undefined) return '-';
    
    const remainingExp = requiredExp - (currentExp % requiredExp);
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
