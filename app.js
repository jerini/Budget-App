// Budget controller
var budgetController = (function() {
    
    var Expense = function(id, description, value){
        this.id=id;
        this.description=description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0 ){
            this.percentage = Math.round((this.value/totalIncome) * 100 );
        } else {
            this.percentage = -1;
        }     
    };
    
   Expense.prototype.getPercentage = function() {
       return this.percentage;
   };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var caculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(currentElement){
            sum += currentElement.value;
            
        });
        
        data.totals[type] = sum;
        
    };
    
    var data = {
      allItems: {
          exp: [],
          inc: []
      },
        totals: {
            exp: 0,
            inc: 0
        },
        
        budget: 0,
        percentage: -1
    };
    
    return{
        addItem:function(type, description, value) {
            
            var newItem, ID;
            
            // create new ID
            if(data.allItems[type].length > 0) {
                ID=data.allItems[type][data.allItems[type].length-1].id + 1; 
            
            } else {
                ID=0;
            }
            
            //create new item 'inc' or 'exp' type
            if(type === 'exp') {
                
                newItem = new Expense(ID, description, value);
                
            } else if(type ==='inc') {
                
                newItem = new Income(ID, description, value);
            }
            
            //push it into data structure
            data.allItems[type].push(newItem);
            //return new element
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
               return current.id;
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
            
        },
        
        calculateBudget: function() {
            
            //calculate total income & expenses
            caculateTotal('exp');
            caculateTotal('inc');
            
            //caculate budget
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate precetage of income spend
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current) {
                current.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPercentages;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
                
            };
        }
    };
})();

// UI controller
var UIController = (function() {
    
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
   var formatNumber = function(num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };
    
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
            
    return{
        getInput: function() {
            return{
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem: function(obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        
        deleteListItem: function(selectorID){
            
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
            
        },
        
        clearFields: function(){
            var fields, fieldsArr;
          fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
          fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                current.value ="";
            });
            
            fieldsArr[0].focus();
        },
        
        displatBudget: function(obj) {
            
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
           
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent ='---';
            }
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expPercentageLabel);
        
            nodeListForEach(fields, function(current, index) {
                
                if(percentages[index] > 0) {
                    
                    current.textContent = percentages[index] + '%';
                    
                } else {
                    
                    current.textContent = '---';
                }
            });
        },
   
        displayMonth: function() {
            
            var now, year, month, months;
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
            
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
            
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();

// App controller
var controller = (function(budgetController, UIController) {
    
    var setupEventListeners = function() {
        var DOM = UIController.getDOMstrings();
        
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        
        document.addEventListener('keypress', function(e){
            
            if(e.key==='Enter' || e.which === '13'){
            ctrlAddItem();
            }      
        });     
        document.querySelector(DOM.container).addEventListener('click', controlDeletItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UIController.changedType);
    };
    
    var updateBudget = function() {
        
        //calculate budget
        budgetController.calculateBudget(); 
        
        //return budget
        var budget = budgetController.getBudget();  
        
        //display budget on the UI
        UIController.displatBudget(budget);    
    };
    
    var updatePercentages = function() {
        
        //calculate percentages
        budgetController.calculatePercentages();
        //read percentages from budget controller
        var percentages = budgetController.getPercentages();
        //update UI
        UIController.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function(){
        var input, newItem;
        
        //1. Get the filed input data
        input=UIController.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0 ){
            
            //Add the item to the budget controller
            newItem = budgetController.addItem(input.type, input.description, input.value);
            
            //Add the item to the UI
            UIController.addListItem(newItem,input.type);
        
            //clear fields
            UIController.clearFields();
        
            //calculate and update budget
            updateBudget();
            
            //calc and update percetages
            updatePercentages();
        } 
    };
    
    var controlDeletItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //delete item from data structure
            budgetController.deleteItem(type, ID);
            
            //delete item from ui
            UIController.deleteListItem(itemID);
            
            //update and show new budget
            updateBudget();
            
            //update percentages
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            UIController.displayMonth();
            UIController.displatBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });   
            setupEventListeners();
        }
    };
    
})(budgetController, UIController);

controller.init();