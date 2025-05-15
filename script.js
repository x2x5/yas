document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const selectAllCheckbox = document.getElementById('selectAll');
    const topicCheckboxes = document.querySelectorAll('.topic-checkbox');
    const selectAllTypesCheckbox = document.getElementById('selectAllTypes');
    const typeCheckboxes = document.querySelectorAll('.type-checkbox');
    const randomButton = document.getElementById('randomButton');
    const resultDiv = document.getElementById('result');
    const chineseText = document.getElementById('chineseText');
    const englishText = document.getElementById('englishText');
    const questionTypeTag = document.getElementById('questionTypeTag');
    
    // 存储题目数据
    const topicsData = {
        education: null,
        society: null,
        technology: null,
        government: null
    };
    
    // 话题类型映射（用于显示中文标签）
    const questionTypeLabels = {
        'discussion': '讨论双方观点',
        'agreement': '同意/不同意程度'
    };
    
    // 加载所有JSON数据
    const loadAllData = async () => {
        try {
            const topics = ['education', 'society', 'technology', 'government'];
            const promises = topics.map(topic => 
                fetch(`${topic}.json`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`加载${topic}.json失败: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        topicsData[topic] = data;
                    })
            );
            
            await Promise.all(promises);
            console.log('所有数据加载完成');
        } catch (error) {
            console.error('加载题目数据失败:', error);
            alert('加载题目数据失败，请检查JSON文件!');
        }
    };
    
    // 初始加载数据
    loadAllData();
    
    // 话题类别全选/取消全选功能
    selectAllCheckbox.addEventListener('change', () => {
        const isChecked = selectAllCheckbox.checked;
        topicCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    });
    
    // 题目类型全选/取消全选功能
    selectAllTypesCheckbox.addEventListener('change', () => {
        const isChecked = selectAllTypesCheckbox.checked;
        typeCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
        });
    });
    
    // 当任何单个话题类别被点击时检查全选状态
    topicCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectAllCheckbox(topicCheckboxes, selectAllCheckbox);
        });
    });
    
    // 当任何单个题目类型被点击时检查全选状态
    typeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateSelectAllCheckbox(typeCheckboxes, selectAllTypesCheckbox);
        });
    });
    
    // 更新全选按钮状态
    function updateSelectAllCheckbox(checkboxes, selectAllCheckbox) {
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        const noneChecked = Array.from(checkboxes).every(checkbox => !checkbox.checked);
        
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = !allChecked && !noneChecked;
    }
    
    // 随机选择话题
    randomButton.addEventListener('click', () => {
        // 获取选中的话题类别
        const selectedTopics = [];
        topicCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedTopics.push(checkbox.dataset.topic);
            }
        });
        
        // 获取选中的题目类型
        const selectedTypes = [];
        typeCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedTypes.push(checkbox.dataset.type);
            }
        });
        
        // 如果没有选择任何话题类别或题目类型，提示用户
        if (selectedTopics.length === 0) {
            alert('请至少选择一个话题类别!');
            return;
        }
        
        if (selectedTypes.length === 0) {
            alert('请至少选择一个题目类型!');
            return;
        }
        
        // 从选中的话题类别和题目类型中收集题目
        let allFilteredQuestions = [];
        
        selectedTopics.forEach(topic => {
            if (topicsData[topic]) {
                selectedTypes.forEach(type => {
                    if (topicsData[topic][type] && topicsData[topic][type].length > 0) {
                        // 为每个题目添加元数据，以便显示标签
                        const questionsWithMeta = topicsData[topic][type].map(q => ({
                            ...q,
                            topicType: topic,
                            questionType: type
                        }));
                        allFilteredQuestions = allFilteredQuestions.concat(questionsWithMeta);
                    }
                });
            }
        });
        
        // 如果没有可用题目，提示用户
        if (allFilteredQuestions.length === 0) {
            alert('所选类别和类型没有可用的题目!');
            return;
        }
        
        // 随机选择一个题目
        const randomIndex = Math.floor(Math.random() * allFilteredQuestions.length);
        const selectedQuestion = allFilteredQuestions[randomIndex];
        
        // 显示选中的题目
        chineseText.textContent = selectedQuestion.chinese;
        englishText.textContent = selectedQuestion.english;
        
        // 显示题目类型标签
        questionTypeTag.textContent = questionTypeLabels[selectedQuestion.questionType] || selectedQuestion.questionType;
        
        // 显示结果区域
        resultDiv.classList.remove('hidden');
    });
}); 