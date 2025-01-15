let previousExp = 0;
let expHistory = [];
let expChart = null;

// กราฟวิเคราะห์
let mapExpChart = null;
let mapFreqChart = null;
let activityExpChart = null;
let activityFreqChart = null;

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

function initChart() {
    const ctx = document.getElementById('expChart').getContext('2d');
    expChart = new Chart(ctx, {
        data: {
            labels: [],
            datasets: [{
                type: 'bar',
                label: 'Experience Gained (%)',
                data: [],
                backgroundColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    return value < 0 ? 'rgba(255, 99, 132, 0.6)' : 'rgba(75, 192, 192, 0.6)';
                },
                borderColor: function(context) {
                    const value = context.dataset.data[context.dataIndex];
                    return value < 0 ? 'rgb(255, 99, 132)' : 'rgb(75, 192, 192)';
                },
                borderWidth: 1,
                barThickness: 20,
                order: 2,
                xAxisID: 'x1'
            },
            {
                type: 'line',
                label: 'Current Level Progress (%)',
                data: [],
                borderColor: '#af6025',
                backgroundColor: '#af6025',
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#af6025',
                fill: false,
                order: 1,
                xAxisID: 'x2'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false, // ปิดการรักษาอัตราส่วน
            layout: {
                padding: {
                    top: 30,
                    right: 15 // เพิ่ม padding ด้านขวาเพื่อให้มีพื้นที่สำหรับ scroll bar
                }
            },
            scales: {
                x1: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Experience Gained per Map (%)',
                        color: '#e7c491'
                    },
                    grid: {
                        drawOnChartArea: true,
                        color: 'rgba(175, 96, 37, 0.2)'
                    },
                    ticks: {
                        color: '#c7c7c7',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x2: {
                    type: 'linear',
                    position: 'top',
                    min: 0,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Current Level Progress (%)',
                        color: '#e7c491'
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        color: '#c7c7c7',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                y: {
                    reverse: true,
                    title: {
                        display: true,
                        text: 'Map Name',
                        color: '#e7c491'
                    },
                    ticks: {
                        color: '#c7c7c7'
                    },
                    grid: {
                        color: 'rgba(175, 96, 37, 0.2)'
                    },
                    afterFit: function(scaleInstance) {
                        // ปรับความสูงขั้นต่ำต่อข้อมูล 1 แถว
                        scaleInstance.height = 40 * scaleInstance.chart.data.labels.length;
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#e7c491'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const dataIndex = context.dataIndex;
                            const entry = expHistory[expHistory.length - 1 - dataIndex];
                            return [
                                `${context.dataset.label}: ${context.parsed.x}%`,
                                `Level: ${entry.mapLevel}`,
                                `Activities: ${entry.activities.join(', ')}`
                            ];
                        }
                    }
                }
            }
        }
    });
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

function toggleGraphSize() {
    const container = document.querySelector('.graph-container');
    const button = document.querySelector('.toggle-graph-btn');
    const buttonText = button.querySelector('span:not(.icon)');
    const buttonIcon = button.querySelector('.icon');
    const canvas = document.getElementById('expChart');
    const isCollapsed = container.classList.toggle('collapsed');
    
    if (isCollapsed) {
        buttonIcon.style.transform = 'rotate(180deg)';
        buttonText.textContent = 'Show Graph';
        canvas.style.display = 'none';
        container.style.height = 'auto';
    } else {
        buttonIcon.style.transform = 'rotate(0deg)';
        buttonText.textContent = 'Hide Graph';
        canvas.style.display = 'block';
        const containerHeight = Math.max(500, (expHistory.length * 40) + 100);
        container.style.height = `${containerHeight}px`;
        
        // รอให้การแสดงผลเสร็จสิ้นก่อนที่จะ resize กราฟ
        setTimeout(() => {
            if (expChart) {
                expChart.resize();
                expChart.update('none');
            }
        }, 10);
    }
}

function calculateTotalProgress() {
    if (expHistory.length === 0) return 0;
    const totalExp = expHistory.reduce((sum, entry) => sum + entry.expGained, 0);
    const currentRequiredExp = parseInt(document.getElementById('requiredExp').value) || 0;
    return ((totalExp / currentRequiredExp) * 100).toFixed(2);
}

function calculateCurrentProgress(currentExp, requiredExp) {
    return ((currentExp / requiredExp) * 100).toFixed(2);
}

function updateChart() {
    const mapData = expHistory.map(entry => ({
        name: entry.mapName || `Map ${entry.mapNumber}`,
        percentage: entry.percentage,
        progress: calculateCurrentProgress(entry.currentExp, entry.requiredExp)
    }));

    // คำนวณความสูงที่ต้องการและกำหนดให้กับ container
    const containerHeight = Math.max(500, (mapData.length * 40) + 100);
    const container = expChart.canvas.parentNode;
    container.style.height = `${containerHeight}px`;

    // อัพเดทข้อมูลกราฟ
    expChart.data.labels = mapData.map(d => d.name);
    expChart.data.datasets[0].data = mapData.map(d => d.percentage);
    expChart.data.datasets[1].data = mapData.map(d => d.progress);
    expChart.update('none');
}

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
    updateChart();
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
        document.getElementById('expHistory').innerHTML = '';
        
        // เรียงลำดับข้อมูลจากใหม่ไปเก่า
        [...expHistory].reverse().forEach((entry) => {
            const currentProgress = calculateCurrentProgress(entry.currentExp, entry.requiredExp);
            
            const historyList = document.getElementById('expHistory');
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="history-map-info">${entry.mapName}: ${entry.expGained.toLocaleString()} exp (${entry.percentage}%)</span>
                <span class="history-activities">Activities: ${entry.activities?.join(', ') || 'None'}</span>
            `;
            historyList.appendChild(listItem);
        });

        // อัพเดท current progress และ progress bar จากข้อมูลล่าสุด
        if (expHistory.length > 0) {
            const lastEntry = expHistory[expHistory.length - 1];
            const currentProgress = calculateCurrentProgress(
                lastEntry.currentExp,
                lastEntry.requiredExp
            );
            
            // อัพเดท progress display ด้วยข้อมูลจาก localStorage
            const charName = localStorage.getItem('defaultCharName') || 'Unknown';
            const charClass = localStorage.getItem('defaultCharClass') || 'Unknown';
            updateProgressDisplay(currentProgress, lastEntry.level, charClass, charName);
            updateProgressBar(currentProgress);
            
            // อัพเดทค่า inputs
            document.getElementById('currentLevel').value = lastEntry.level;
            document.getElementById('requiredExp').value = lastEntry.requiredExp;
            document.getElementById('currentExp').value = lastEntry.currentExp;
            previousExp = lastEntry.currentExp;
        }

        updateChart();
    }

    if (expHistory.length > 0) {
        updateAnalysis();
    }
}

// แก้ไขฟังก์ชัน clearAllData
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
        previousExp = 0;
        expHistory = [];
        
        localStorage.removeItem('expHistory');
        localStorage.removeItem('defaultLevel');
        localStorage.removeItem('defaultRequiredExp');
        localStorage.removeItem('defaultCurrentExp');
        localStorage.removeItem('defaultCharName');
        localStorage.removeItem('defaultCharClass');
        
        // Clear display elements
        document.getElementById('expGained').textContent = '';
        document.getElementById('expPercentage').textContent = '';
        document.getElementById('expHistory').innerHTML = '';
        document.getElementById('currentProgress').innerHTML = '';
        
        // Clear form inputs
        document.getElementById('currentLevel').value = '';
        document.getElementById('requiredExp').value = '';
        document.getElementById('currentExp').value = '';
        document.getElementById('characterName').value = '';
        document.getElementById('characterClass').value = '';
        document.getElementById('mapLevel').value = '';
        document.getElementById('mapName').value = '';
        
        // Reset charts
        expChart.data.labels = [];
        expChart.data.datasets[0].data = [];
        expChart.data.datasets[1].data = [];
        expChart.update();

        mapExpChart.data.labels = [];
        mapExpChart.data.datasets[0].data = [];
        mapExpChart.update();

        mapFreqChart.data.labels = [];
        mapFreqChart.data.datasets[0].data = [];
        mapFreqChart.update();

        activityExpChart.data.labels = [];
        activityExpChart.data.datasets[0].data = [];
        activityExpChart.update();

        activityFreqChart.data.labels = [];
        activityFreqChart.data.datasets[0].data = [];
        activityFreqChart.update();

        // Reset progress bar
        updateProgressBar(0);

        // Clear summary
        const summaryElement = document.getElementById('recordSummary');
        summaryElement.innerHTML = '';
        summaryElement.classList.remove('show');
    }
}

// เพิ่มการเริ่มต้นกราฟวิเคราะห์
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    initAnalysisCharts();
    loadDefaultValues();
    loadFromLocalStorage();
});
