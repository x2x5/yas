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
    
    // 初始禁用随机按钮，直到数据加载完成
    randomButton.disabled = true;
    randomButton.textContent = '正在加载数据...';
    
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
        let retryCount = 0;
        const maxRetries = 3;
        
        async function attemptLoad() {
            try {
                console.log('开始加载话题数据，尝试次数:', retryCount + 1);
                randomButton.textContent = `正在加载数据... (${retryCount + 1}/${maxRetries})`;
                
                const [educationResponse, societyResponse, technologyResponse, governmentResponse] = await Promise.all([
                    fetch('education.json').catch(e => { throw new Error(`教育数据加载失败: ${e.message}`); }),
                    fetch('society.json').catch(e => { throw new Error(`社会数据加载失败: ${e.message}`); }),
                    fetch('technology.json').catch(e => { throw new Error(`科技数据加载失败: ${e.message}`); }),
                    fetch('government.json').catch(e => { throw new Error(`政府数据加载失败: ${e.message}`); })
                ]);
                
                if (!educationResponse.ok || !societyResponse.ok || !technologyResponse.ok || !governmentResponse.ok) {
                    throw new Error('一个或多个请求返回了错误状态码');
                }
                
                const educationJson = await educationResponse.json().catch(e => { throw new Error(`教育数据解析失败: ${e.message}`); });
                const societyJson = await societyResponse.json().catch(e => { throw new Error(`社会数据解析失败: ${e.message}`); });
                const technologyJson = await technologyResponse.json().catch(e => { throw new Error(`科技数据解析失败: ${e.message}`); });
                const governmentJson = await governmentResponse.json().catch(e => { throw new Error(`政府数据解析失败: ${e.message}`); });
                
                // 处理JSON数据，将类型添加到每个题目中
                educationData = processTopicData(educationJson, 'education');
                societyData = processTopicData(societyJson, 'society');
                technologyData = processTopicData(technologyJson, 'technology');
                governmentData = processTopicData(governmentJson, 'government');
                
                console.log('话题数据加载完成');
                console.log('教育数据项数:', educationData.length);
                console.log('社会数据项数:', societyData.length);
                console.log('科技数据项数:', technologyData.length);
                console.log('政府数据项数:', governmentData.length);
                
                if (educationData.length === 0 && societyData.length === 0 && 
                    technologyData.length === 0 && governmentData.length === 0) {
                    throw new Error('所有数据集都为空');
                }
                
                // 数据加载完成后启用随机按钮
                randomButton.disabled = false;
                randomButton.textContent = '随机选择话题';
                
                // 数据加载完成后初始化选择状态
                initSelectionState();
                
                return true;
            } catch (error) {
                console.error('加载话题数据出错:', error);
                retryCount++;
                
                if (retryCount < maxRetries) {
                    console.log(`将在2秒后重试 (${retryCount}/${maxRetries})...`);
                    return new Promise(resolve => {
                        setTimeout(() => resolve(attemptLoad()), 2000);
                    });
                } else {
                    console.error('达到最大重试次数，放弃加载');
                    randomButton.disabled = false;
                    randomButton.textContent = '加载失败，点击重试';
                    
                    // 添加重试点击事件
                    randomButton.addEventListener('click', function retryHandler() {
                        randomButton.removeEventListener('click', retryHandler);
                        randomButton.disabled = true;
                        randomButton.textContent = '正在重新加载...';
                        retryCount = 0;
                        attemptLoad();
                    }, { once: true });
                    
                    return false;
                }
            }
        }
        
        return attemptLoad();
    }
    
    // 处理话题数据，将类型信息添加到每个题目中
    function processTopicData(jsonData, topicCategory) {
        let processedData = [];
        
        // 处理讨论类型题目
        if (jsonData.discussion) {
            const discussionTopics = jsonData.discussion.map(item => ({
                ...item,
                type: 'discussion',
                category: topicCategory
            }));
            processedData = processedData.concat(discussionTopics);
        }
        
        // 处理同意/不同意类型题目
        if (jsonData.agreement) {
            const agreementTopics = jsonData.agreement.map(item => ({
                ...item,
                type: 'agreement',
                category: topicCategory
            }));
            processedData = processedData.concat(agreementTopics);
        }
        
        return processedData;
    }
    
    // 更新所有话题类别复选框
    function updateAllCheckboxes() {
        const isChecked = selectAllCheckbox.checked;
        topicCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            checkbox.dispatchEvent(new Event('change')); // 触发change事件以确保状态更新
        });
    }
    
    // 更新所有题目类型复选框
    function updateAllTypeCheckboxes() {
        const isChecked = selectAllTypesCheckbox.checked;
        typeCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            checkbox.dispatchEvent(new Event('change')); // 触发change事件以确保状态更新
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
        
        // 如果全选被选中，直接返回所有数据
        if (selectAllCheckbox.checked) {
            return [...educationData, ...societyData, ...technologyData, ...governmentData];
        }
        
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
        
        // 如果全选题目类型被选中，直接返回所有类型
        if (selectAllTypesCheckbox.checked) {
            return ['discussion', 'agreement'];
        }
        
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
        
        // 确保即使没有明确选择，也能返回默认的所有数据
        if (selectedTopicData.length === 0) {
            if (educationData.length === 0 && societyData.length === 0 && 
                technologyData.length === 0 && governmentData.length === 0) {
                console.error('数据尚未加载完成');
                alert('数据尚未加载完成，请稍后再试');
                return null;
            }
            // 如果没有选择但数据已加载，使用所有数据
            var allData = [...educationData, ...societyData, ...technologyData, ...governmentData];
            if (selectedTypes.length === 0) {
                // 如果题目类型也没有选择，使用所有类型
                const randomIndex = Math.floor(Math.random() * allData.length);
                return allData[randomIndex];
            } else {
                // 只筛选题目类型
                const filteredTopics = allData.filter(topic => selectedTypes.includes(topic.type));
                if (filteredTopics.length === 0) {
                    alert('没有符合所选条件的话题');
                    return null;
                }
                const randomIndex = Math.floor(Math.random() * filteredTopics.length);
                return filteredTopics[randomIndex];
            }
        }
        
        if (selectedTypes.length === 0) {
            // 如果没有选择题目类型但选择了话题类别，使用所有题目类型
            const randomIndex = Math.floor(Math.random() * selectedTopicData.length);
            return selectedTopicData[randomIndex];
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
            // 如果按钮显示重试文本，不做任何操作（已经在loadTopicData中添加了重试处理程序）
            if (randomButton.textContent === '加载失败，点击重试') {
                return;
            }
            
            // 如果数据还在加载中，提醒用户等待
            if (randomButton.disabled) {
                alert('数据正在加载中，请稍候...');
                return;
            }
            
            const randomTopic = getRandomTopic();
            
            if (randomTopic) {
                resultDiv.classList.remove('hidden');
                chineseTextElement.textContent = randomTopic.chinese;
                englishTextElement.textContent = randomTopic.english;
                questionTypeTagElement.textContent = getQuestionTypeText(randomTopic.type);
            }
        });
    }
    
    // 初始化选择状态
    function initSelectionState() {
        console.log('正在初始化选择状态...');
        // 初始化选中全部
        selectAllCheckbox.checked = true;
        selectAllTypesCheckbox.checked = true;
        
        // 手动设置所有子复选框
        topicCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        typeCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        console.log('选择状态初始化完成');
    }
    
    // 页面加载完成后初始化
    initDarkMode();
    
    // 先立即初始化一次选择状态（即使数据尚未加载）
    initSelectionState();
    
    // 然后加载数据并再次初始化选择状态
    loadTopicData();
    
    // 初始化事件监听
    initEventListeners();
}); 