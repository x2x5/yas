document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const selectAllCheckbox = document.getElementById('selectAll');
    const topicCheckboxes = document.querySelectorAll('.topic-checkbox');
    const selectAllTypesCheckbox = document.getElementById('selectAllTypes');
    const typeCheckboxes = document.querySelectorAll('.type-checkbox');
    const randomButton = document.getElementById('randomButton');
    const resultDiv = document.getElementById('result');
    const chineseTextElement = document.getElementById('chineseText');
    const englishTextElement = document.getElementById('englishText');
    const questionTypeTagElement = document.getElementById('questionTypeTag');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // 夜间模式功能
    function initDarkMode() {
        // 检查本地存储中的夜间模式设置
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // 应用保存的设置
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeToggle.textContent = '☀️';
        }
        
        // 添加切换事件
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            darkModeToggle.textContent = isDark ? '☀️' : '🌙';
        });
    }
    
    // 话题数据
    let educationData = [];
    let societyData = [];
    let technologyData = [];
    let governmentData = [];
    
    // 加载话题数据
    async function loadTopicData() {
        try {
            const [educationResponse, societyResponse, technologyResponse, governmentResponse] = await Promise.all([
                fetch('education.json'),
                fetch('society.json'),
                fetch('technology.json'),
                fetch('government.json')
            ]);
            
            educationData = await educationResponse.json();
            societyData = await societyResponse.json();
            technologyData = await technologyResponse.json();
            governmentData = await governmentResponse.json();
            
            // 初始化选中全部
            selectAllCheckbox.checked = true;
            selectAllTypesCheckbox.checked = true;
            updateAllCheckboxes();
            updateAllTypeCheckboxes();
        } catch (error) {
            console.error('加载话题数据出错:', error);
        }
    }
    
    // 更新所有话题类别复选框
    function updateAllCheckboxes() {
        const isChecked = selectAllCheckbox.checked;
        topicCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    }
    
    // 更新所有题目类型复选框
    function updateAllTypeCheckboxes() {
        const isChecked = selectAllTypesCheckbox.checked;
        typeCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    }
    
    // 检查个别复选框状态
    function checkIndividualCheckboxes() {
        const allChecked = Array.from(topicCheckboxes).every(checkbox => checkbox.checked);
        selectAllCheckbox.checked = allChecked;
    }
    
    // 检查个别题目类型复选框状态
    function checkIndividualTypeCheckboxes() {
        const allChecked = Array.from(typeCheckboxes).every(checkbox => checkbox.checked);
        selectAllTypesCheckbox.checked = allChecked;
    }
    
    // 获取选中的话题类别数据
    function getSelectedTopicData() {
        let selectedData = [];
        
        topicCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                const topic = checkbox.dataset.topic;
                
                switch (topic) {
                    case 'education':
                        selectedData = selectedData.concat(educationData);
                        break;
                    case 'society':
                        selectedData = selectedData.concat(societyData);
                        break;
                    case 'technology':
                        selectedData = selectedData.concat(technologyData);
                        break;
                    case 'government':
                        selectedData = selectedData.concat(governmentData);
                        break;
                }
            }
        });
        
        return selectedData;
    }
    
    // 获取选中的题目类型
    function getSelectedQuestionTypes() {
        const selectedTypes = [];
        
        typeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedTypes.push(checkbox.dataset.type);
            }
        });
        
        return selectedTypes;
    }
    
    // 获取随机话题
    function getRandomTopic() {
        const selectedTopicData = getSelectedTopicData();
        const selectedTypes = getSelectedQuestionTypes();
        
        if (selectedTopicData.length === 0 || selectedTypes.length === 0) {
            alert('请至少选择一个话题类别和一个题目类型');
            return null;
        }
        
        // 筛选符合选中题目类型的话题
        const filteredTopics = selectedTopicData.filter(topic => {
            return selectedTypes.includes(topic.type);
        });
        
        if (filteredTopics.length === 0) {
            alert('没有符合所选条件的话题');
            return null;
        }
        
        // 随机选择一个话题
        const randomIndex = Math.floor(Math.random() * filteredTopics.length);
        return filteredTopics[randomIndex];
    }
    
    // 获取题目类型中文名称
    function getQuestionTypeText(type) {
        switch (type) {
            case 'discussion':
                return '讨论双方观点';
            case 'agreement':
                return '同意/不同意程度';
            default:
                return '';
        }
    }
    
    // 初始化事件监听
    function initEventListeners() {
        // 全选话题类别
        selectAllCheckbox.addEventListener('change', updateAllCheckboxes);
        
        // 监听个别话题类别
        topicCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', checkIndividualCheckboxes);
        });
        
        // 全选题目类型
        selectAllTypesCheckbox.addEventListener('change', updateAllTypeCheckboxes);
        
        // 监听个别题目类型
        typeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', checkIndividualTypeCheckboxes);
        });
        
        // 随机选择话题按钮
        randomButton.addEventListener('click', () => {
            const randomTopic = getRandomTopic();
            
            if (randomTopic) {
                resultDiv.classList.remove('hidden');
                chineseTextElement.textContent = randomTopic.chinese;
                englishTextElement.textContent = randomTopic.english;
                questionTypeTagElement.textContent = getQuestionTypeText(randomTopic.type);
            }
        });
    }
    
    // 页面加载完成后初始化
    initDarkMode();
    loadTopicData();
    initEventListeners();
}); 