$(function(){
    let todos = [];

    let ofCurrentState = [];

    let currentlyOnScreen = [];

    let idcounter = 0;

    let completionState = 'ALL';

    let currentPage = 1;

    let app = {
        showTodos: function() {
            app.countTodos();
            app.paginate();

            let todosListEl = $('#todo-list');
            todosListEl.html('');
            let wholeList = "";
            currentlyOnScreen.forEach(function(todo) {
                let checkedClasses = todo.isCompleted;
                /*jshint multistr: true */
                let element = '<li class="list-group-item list-elem-editable' + (checkedClasses ? ' list-group-item-success' : '') + ' form-check">\
                                   <input type="checkbox" class="check-item" ' + (checkedClasses ? 'checked="checked"' : '') + '>\
                                   <span class="neutral-task">' + todo.task + '</span>\
                                   <button class="btn btn-danger delete-button">Delete</button>\
                               </li>';
                wholeList = element + wholeList;
            });
            todosListEl.append(wholeList);

            app.showActiveState();
            app.switchPage();
        },

        paginate: function () {
            currentlyOnScreen = [];

            function checkFit (todo) {
                let checkedClasses = todo.isCompleted;
                if ((completionState === 'ALL') ||((completionState === 'INCOMPLETE') && (checkedClasses === false)) || ((completionState === 'COMPLETED') && (checkedClasses === true))) {
                    return true;
                }
            }

            ofCurrentState = todos.filter(checkFit);

            function checkFittest (todo) {
                let reverseIndex = ofCurrentState.length - ofCurrentState.indexOf(todo) - 1;
                let compareHelper1 = 5 * currentPage;
                let compareHelper2 = compareHelper1 - 5;
                if ((reverseIndex < compareHelper1)&&(reverseIndex>= compareHelper2)) {
                    return true;
                }
            }

            currentlyOnScreen = ofCurrentState.filter(checkFittest);

        },

        showActiveState: function () {
            $('.state-switch').removeClass('active');

            if (completionState === 'ALL') {
                $('#show-all').addClass('active');
            } else if (completionState === 'COMPLETED') {
                $('#show-completed').addClass('active');
            } else if (completionState === 'INCOMPLETE') {
                $('#show-incomplete').addClass('active');
            }
        },

        switchPage: function () {
            let linesNum = ofCurrentState.length;

            $('#pagination').html("");

            if (linesNum > 5) {
                let pageNum = Math.ceil(linesNum/5);
                for (let i=1;i<=pageNum;) {
                    $('#pagination').append('<button data-page="'+i+'"  class="btn btn-primary page-change">'+ i++ +'<span class="sr-only">(current)</span></button>');
                }
            }

            let pageChange = $('.page-change');
            pageChange.removeClass('active');
            pageChange.eq(currentPage - 1).addClass('active');
            app.countTodos();
        },

        addTodo: function() {
            event.preventDefault();

            let createInput = $('#create-input');
            let createInputValue = createInput.val().trim();

            let errorMessage = null;

            if (!createInputValue) {
                errorMessage = 'Task cannot be empty.';
            } else {
                todos.forEach(function(todo) {
                    if (todo.task === createInputValue) {
                        errorMessage = 'task already exists.';
                    }
                });
            }

            if (errorMessage) {
                app.showError(errorMessage);
                return;
            }

            todos.push({
                id: idcounter,
                task: createInputValue,
                isCompleted: false
            });

            idcounter ++;
            $("#check-all").prop("checked", false);

            createInput.val("");
            app.showTodos();

        },

        enterEditMode: function() {
            let actionsLine = $(this).closest('li');
            let taskCell = actionsLine.find('span');
            taskCell.removeClass('neutral-task').addClass('task-in-edit-mode');
            actionsLine.removeClass('list-elem-editable');
            actionsLine.find('.delete-button').hide();

            app.currentTask = taskCell.text();
            taskCell.html('<input type="text" id="edit-input" onblur="' + app.exitEditMode() + '" value="' + app.currentTask + '" autofocus />');
            $('#edit-input').focus();
        },

        exitEditMode: function() {
            let actionsLine = $('#edit-input').closest('li');
            let taskCell = actionsLine.find('span');
            taskCell.removeClass('task-in-edit-mode').addClass('neutral-task');
            actionsLine.addClass('list-elem-editable');

            actionsLine.find('.delete-button').show();

            taskCell.html(app.currentTask);
        },

        saveTask: function() {
            let editInput = $('#edit-input');
            let newTask = editInput.val();

            let actionsCell = editInput.closest('li');
            let helperID = $('li').index(actionsCell);
            let taskID = currentlyOnScreen.length - helperID - 1;

            if (newTask.trim() !== '') {
                todos.forEach(function(todo) {
                    if (currentlyOnScreen[taskID].id === todo.id) {
                        todo.task = newTask;
                        app.currentTask = newTask;
                    }
                });
            }

            app.exitEditMode.call(this);
        },

        deleteTask: function() {
            let actionsCell = $(this).closest('li');
            let helperID = $('li').index(actionsCell);
            let taskID = currentlyOnScreen.length - helperID - 1;

            todos.forEach(function (todo, index) {
                if (currentlyOnScreen[taskID].id === todo.id) {
                    todos.splice(index, 1);
                }
            });
            app.showTodos();
        },

        showError: function(errorMessage) {
            window.alert(errorMessage);
        },

        toggleTodo: function () {
            let taskLine = $(this).closest('li');
            let taskID = $('li').index(taskLine);
            let actualID = currentlyOnScreen.length - 1;
            let toggledTask = currentlyOnScreen[(actualID - taskID)].id;

            todos.forEach(function(todo) {
                if (toggledTask === todo.id) {
                    todo.isCompleted = !todo.isCompleted;
                }
            });
            app.showTodos();
        },

        toggleAll: function () {
            let condition = $(this).prop("checked");
            $(".check-item").prop("checked", condition);
            todos.forEach(function(todo) {
                todo.isCompleted = condition;
            });
            app.showTodos();
        },

        deleteSelected: function() {
            function ifSelected (todo) {
                return todo.isCompleted === false;
            }

            todos = todos.filter(ifSelected);

            app.showTodos();
        },

        countTodos: function() {
            function isCompleted(todo) {
                return todo.isCompleted === true;
            }
            let total = todos.length;
            let completed = todos.filter(isCompleted).length;
            let incomplete = total - completed;

            $('#cmplt').html(completed);
            $('#incmp').html(incomplete);

            const check = ((incomplete === 0) && completed > 0 ) ? true : false;
            $("#check-all").prop("checked", check);

            let compareHelper = ((currentPage * 5) - 5);

            if ((currentPage !== 1) && (((completionState === 'ALL') && ((total) <= compareHelper))||((completionState === 'COMPLETED') && (completed <= compareHelper))||((completionState === 'INCOMPLETE') && (incomplete <= compareHelper)))) {
                        currentPage --;
            }
        },

        switchState: function () {
            let switcher = $(this).attr('id');

            if (switcher === 'show-all') {
                completionState = 'ALL';
            } else if (switcher === 'show-incomplete') {
                completionState = 'INCOMPLETE';
            } else if (switcher === 'show-completed') {
                completionState = 'COMPLETED';
            }

            currentPage = 1;
            app.showTodos();
        },
    };


    app.showTodos();
    let listing = $('ul');
    $('#addition').on('click', app.addTodo);
    listing.on('dblclick', '.list-elem-editable', app.enterEditMode);
    listing.on('click', '.cancel-button', app.exitEditMode);
    listing.on('click', '.save-button', app.saveTask);
    listing.on('click', '.delete-button', app.deleteTask);
    $('#create-form').on('click', '#delete-selected', app.deleteSelected);
    $('#buttons').on('click', '.state-switch', app.switchState);
    $('#create-form').on('change', '#check-all', app.toggleAll);
    listing.on('blur', '#edit-input', app.exitEditMode);
    listing.on('keyup', '#edit-input', function () {
        if (event.keyCode === 13) {
            app.saveTask();
            app.exitEditMode();
        } else if (event.keyCode === 27) {
            app.exitEditMode();
        }
    });
    listing.on('change', '.check-item', app.toggleTodo);
    $("#create-input").keyup(function(event) {
        if (event.keyCode === 13) {
            $("#addition").click();
        }
    });
    $('#pagination').on('click', '.page-change', function(){
        currentPage = $('.page-change').index(this) + 1;
        let pageNum = $(this).attr('data-page');
        $('.pagination li').removeClass('active');
        $('.page-change').removeClass('active');
        $('.page-change:eq(' + (pageNum - 1) + ')').addClass('active');
        app.showTodos();
    });
});