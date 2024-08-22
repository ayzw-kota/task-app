document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');

    // タスクを取得して表示
    fetchTasks();

    // タスク追加のイベントリスナー
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        addTask(title, description);
    });

    // タスクを取得する関数
    function fetchTasks() {
        fetch('/api/tasks')
            .then(response => response.json())
            .then(tasks => {
                taskList.innerHTML = '';
                tasks.forEach(task => {
                    const li = createTaskElement(task);
                    taskList.appendChild(li);
                });
            })
            .catch(error => console.error('Error:', error));
    }

    // タスクを追加する関数
    function addTask(title, description) {
        fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description, completed: false }),
        })
        .then(response => response.json())
        .then(newTask => {
            const li = createTaskElement(newTask);
            taskList.appendChild(li);
            taskForm.reset();
        })
        .catch(error => console.error('Error:', error));
    }

    // タスク要素を作成する関数
    function createTaskElement(task) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}">${task.title}</span>
            <p>${task.description}</p>
            <button class="delete-btn" data-id="${task.id}">削除</button>
            <button class="toggle-btn" data-id="${task.id}">${task.completed ? '未完了' : '完了'}</button>
        `;

        // 削除ボタンのイベントリスナー
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

        // 完了トグルボタンのイベントリスナー
        li.querySelector('.toggle-btn').addEventListener('click', () => toggleTaskCompletion(task));

        return li;
    }

    // タスクを削除する関数
    function deleteTask(id) {
        fetch(`/api/tasks/${id}`, { method: 'DELETE' })
            .then(() => {
                const taskElement = document.querySelector(`li button[data-id="${id}"]`).parentNode;
                taskElement.remove();
            })
            .catch(error => console.error('Error:', error));
    }

    // タスクの完了状態を切り替える関数
    function toggleTaskCompletion(task) {
        const updatedTask = { ...task, completed: !task.completed };
        fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedTask),
        })
        .then(response => response.json())
        .then(updatedTask => {
            const taskElement = document.querySelector(`li button[data-id="${updatedTask.id}"]`).parentNode;
            taskElement.replaceWith(createTaskElement(updatedTask));
        })
        .catch(error => console.error('Error:', error));
    }
});
