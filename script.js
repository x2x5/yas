document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const selectAllCheckbox = document.getElementById('selectAll');
    const topicCheckboxes = document.querySelectorAll('.topic-checkbox');
    const randomButton = document.getElementById('randomButton');
    const resultDiv = document.getElementById('result');
    const agreementChineseText = document.getElementById('agreementChineseText');
    const agreementEnglishText = document.getElementById('agreementEnglishText');
    const discussionChineseText = document.getElementById('discussionChineseText');
    const discussionEnglishText = document.getElementById('discussionEnglishText');
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    // 初始禁用随机按钮，直到数据处理完成
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
    let allTopicsData = [];
    
    // 加载话题数据
    async function loadTopicData() {
        try {
            console.log('开始加载话题数据');
            
            // 首先尝试通过fetch加载数据
            try {
                const response = await fetch('./data.json');
                if (response.ok) {
                    allTopicsData = await response.json();
                    console.log('通过fetch成功加载数据');
                } else {
                    throw new Error('获取失败');
                }
            } catch (fetchError) {
                console.warn('通过fetch加载数据失败，使用内嵌数据作为备份', fetchError);
                
                // 如果fetch失败，使用内嵌的备份数据
                allTopicsData = [
                    {
                        "chinese": "有些人认为大学教育的主要目的是帮助毕业生找到更好的工作，而另一些人则认为大学教育对个人和社会有更广泛的好处。你在多大程度上同意或不同意前一种观点？",
                        "english": "Some people believe that the main purpose of university education is to help graduates find better jobs, while others believe it has wider benefits for individuals and society. To what extent do you agree or disagree with the former view?",
                        "type": "agreement",
                        "topic": "education"
                    },
                    {
                        "chinese": "正式考试是评估学生表现的唯一有效方式。你在多大程度上同意或不同意？",
                        "english": "Formal examinations are the only effective way to assess a student's performance. To what extent do you agree or disagree?",
                        "type": "agreement",
                        "topic": "education"
                    },
                    {
                        "chinese": "政府应该在经济中扮演积极干预者还是限制干预的角色？讨论这两种观点。",
                        "english": "Should governments play an active interventionist role in the economy or should they limit their intervention? Discuss both views.",
                        "type": "discussion",
                        "topic": "government"
                    },
                    {
                        "chinese": "社交媒体平台对用户的心理健康主要产生负面影响。你在多大程度上同意或不同意？",
                        "english": "Social media platforms have a predominantly negative impact on users' mental well-being. To what extent do you agree or disagree?",
                        "type": "agreement",
                        "topic": "technology"
                    },
                    {
                        "chinese": "传统家庭结构在现代社会中变得无关紧要。你在多大程度上同意或不同意？",
                        "english": "Traditional family structures are becoming irrelevant in modern society. To what extent do you agree or disagree?",
                        "type": "agreement",
                        "topic": "society"
                    }
                ];
                console.log('已加载备份数据');
            }
            
            console.log('话题数据加载完成');
            console.log('数据项数:', allTopicsData.length);
            
            if (allTopicsData.length === 0) {
                throw new Error('数据集为空');
            }
            
            // 数据加载完成后启用随机按钮
            randomButton.disabled = false;
            randomButton.textContent = '抽题';
            
            // 数据加载完成后初始化选择状态
            initSelectionState();
            
            return true;
        } catch (error) {
            console.error('处理话题数据出错:', error);
            randomButton.disabled = false;
            randomButton.textContent = '加载失败，点击重试';
            
            // 添加重试点击事件
            randomButton.addEventListener('click', function retryHandler() {
                randomButton.removeEventListener('click', retryHandler);
                randomButton.disabled = true;
                randomButton.textContent = '正在重新加载...';
                loadTopicData();
            }, { once: true });
            
            return false;
        }
    }
    
    // 更新所有话题类别复选框
    function updateAllCheckboxes() {
        const isChecked = selectAllCheckbox.checked;
        topicCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            checkbox.dispatchEvent(new Event('change')); // 触发change事件以确保状态更新
        });
    }
    
    // 检查个别复选框状态
    function checkIndividualCheckboxes() {
        const allChecked = Array.from(topicCheckboxes).every(checkbox => checkbox.checked);
        selectAllCheckbox.checked = allChecked;
    }
    
    // 获取选中的话题类别
    function getSelectedTopics() {
        const selectedTopics = [];
        
        topicCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedTopics.push(checkbox.dataset.topic);
            }
        });
        
        return selectedTopics;
    }
    
    // 根据话题类别和类型过滤数据
    function getFilteredTopics(type) {
        const selectedTopics = getSelectedTopics();
        
        // 如果全选被选中，或者未选择任何话题，则不按话题过滤
        if (selectAllCheckbox.checked || selectedTopics.length === 0) {
            return allTopicsData.filter(item => item.type === type);
        }
        
        // 按话题类别和类型过滤
        return allTopicsData.filter(item => 
            selectedTopics.includes(item.topic) && item.type === type
        );
    }
    
    // 随机选择话题
    function getRandomTopics() {
        // 获取按类型过滤的话题列表
        const agreementTopics = getFilteredTopics('agreement');
        const discussionTopics = getFilteredTopics('discussion');
        
        // 检查是否有符合条件的题目
        if (agreementTopics.length === 0 || discussionTopics.length === 0) {
            console.error('没有足够的题目满足条件');
            alert('所选类别中没有足够的题目，请选择更多类别');
            return null;
        }
        
        // 随机选择每种类型的一个题目
        const randomAgreementTopic = agreementTopics[Math.floor(Math.random() * agreementTopics.length)];
        const randomDiscussionTopic = discussionTopics[Math.floor(Math.random() * discussionTopics.length)];
        
        return {
            agreement: randomAgreementTopic,
            discussion: randomDiscussionTopic
        };
    }
    
    // 初始化事件监听器
    function initEventListeners() {
        // 全选话题复选框事件
        selectAllCheckbox.addEventListener('change', updateAllCheckboxes);
        
        // 个别话题复选框事件
        topicCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', checkIndividualCheckboxes);
        });
        
        // 随机按钮点击事件
        randomButton.addEventListener('click', () => {
            const selectedTopics = getRandomTopics();
            if (!selectedTopics) return;
            
            // 显示选中的话题
            agreementChineseText.textContent = selectedTopics.agreement.chinese;
            agreementEnglishText.textContent = selectedTopics.agreement.english;
            discussionChineseText.textContent = selectedTopics.discussion.chinese;
            discussionEnglishText.textContent = selectedTopics.discussion.english;
            
            resultDiv.classList.remove('hidden');
            
            // 自动滚动到结果区域
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
    
    // 初始化选择状态
    function initSelectionState() {
        // 默认选中所有话题
        selectAllCheckbox.checked = true;
        updateAllCheckboxes();
    }
    
    // 初始化应用
    async function initApp() {
        initDarkMode();
        initEventListeners();
        await loadTopicData();
    }
    
    // 启动应用
    initApp();
}); 