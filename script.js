var iframe;
var iframeDoc;

var variants_array = {};
var tasks = {};
var resources;
var variant_number;
var variant;
var task_array;
var task_number;

var task = 0;
var consumer = 0;
var storage = 0;
var storage_sum = 0;

//EventListener-ы для кнопки перехода на следующее задание
function next_task(){

    document.querySelector('.main').classList.add('darkened');
    document.querySelector('.pop_up').classList.remove('closed');

    update_task_number(task_number+2);
    task_number = get_task_number()-1;
    start_task(resources, task_number, tasks, variants_array);

    if(task_number==4){
        editor.setValue("matrix = "+resources.desicions[variant_number].real_north_west.matrix+";");
    } else if(task_number==5){
        editor.setValue("matrix = "+resources.desicions[variant_number].real_north_west.matrix+";\nsum = 0;");
    }
}

function finish(){
    document.querySelector('.main').classList.add('darkened');
    document.querySelector('.pop_up p').innerHTML = "Поздравляем! Вы закончили все упражнения!";
    document.querySelector('.nexttask').disabled = true;
    document.querySelector('.pop_up').classList.remove('closed');
}

//EventListener для кнопки перехода на предыдущее задание
function prev_task(){

    document.querySelector('.main').classList.add('darkened');
    document.querySelector('.pop_up').classList.remove('closed');

    update_task_number(task_number);
    task_number = get_task_number()-1;
    start_task(resources, task_number, tasks, variants_array);

    document.querySelector('.nexttask').disabled = false;
}

//Парсер данных из редактора для отрисовки sв iframe
function work_ace(){

    if((task_number==0)||(task_number==1)||(task_number==5)){
        var user_answer = execute_ace();
        console.log(user_answer);
        var user_answer_arr = user_answer.split(';');
        console.log(user_answer_arr);

        var user_matrix = user_answer_arr[0].split('=')[1];
        user_matrix = user_matrix.split('[').join('');
        user_matrix = user_matrix.split(']').join('');
        user_matrix = user_matrix.split(' ').join('');
        user_matrix = user_matrix.split(',');

        var user_sum = user_answer_arr[1].split('=')[1];

        var user_answer = {
            "matrix": user_matrix,
            "sum": user_sum
        }

    }else if(task_number==2){

        var user_answer = execute_ace();
        console.log(user_answer);
        var user_answer_arr = user_answer.split(';');
        console.log(user_answer_arr);

        var user_u = user_answer_arr[0].split('=')[1];
        user_u = user_u.split('[').join('');
        user_u = user_u.split(']').join('');
        user_u = user_u.split(' ').join('');
        user_u = user_u.split(',');

        var user_v = user_answer_arr[1].split('=')[1];
        user_v = user_v.split('[').join('');
        user_v = user_v.split(']').join('');
        user_v = user_v.split(' ').join('');
        user_v = user_v.split(',');

        var user_answer = {
            "u": user_u,
            "v": user_v
        }

    }else if((task_number==3)||(task_number==4)){

        var user_answer = execute_ace();
        console.log(user_answer);
        var user_answer_arr = user_answer.split(';');
        console.log(user_answer_arr);

        var user_matrix = user_answer_arr[0].split('=')[1];
        user_matrix = user_matrix.split('[').join('');
        user_matrix = user_matrix.split(']').join('');
        user_matrix = user_matrix.split(' ').join('');
        user_matrix = user_matrix.split(',');

        var user_answer = {
            "matrix": user_matrix
        }
    }

    console.log(user_answer);
    return user_answer;

}

//EventListener для прорисовки данных из редактора в iframe
function draw_ace(){

    var user_answer = work_ace();

    if((task_number==0)||(task_number==1)||(task_number==5)){

        var lines = iframeDoc.querySelectorAll('tr');
        for(var iii = 0; iii<lines.length;iii++){
            var columnes = lines[iii].querySelectorAll('td');
            for(var jjj = 0; jjj<columnes.length;jjj++){
                columnes[jjj].innerHTML = user_answer.matrix[iii*5+jjj];
            }
        }

        iframeDoc.querySelectorAll('input')[0].value = user_answer.sum;
        try_sigma(user_answer);

    } else if(task_number==2){
        var lines = iframeDoc.querySelectorAll('tr');

        var columnes = lines[0].querySelectorAll('td');
        for(var jjj = 0; jjj<columnes.length;jjj++){
            columnes[jjj].innerHTML = user_answer.u[jjj];
        }

        var columnes = lines[1].querySelectorAll('td');
        for(var jjj = 0; jjj<columnes.length;jjj++){
            columnes[jjj].innerHTML = user_answer.v[jjj];
        }
    } else if((task_number==3)||(task_number==4)){

        var lines = iframeDoc.querySelectorAll('tr');
        for(var iii = 0; iii<lines.length;iii++){
            var columnes = lines[iii].querySelectorAll('td');
            for(var jjj = 0; jjj<columnes.length;jjj++){
                columnes[jjj].innerHTML = user_answer.matrix[iii*5+jjj];
            }
        }

    }


    return user_answer;
}

function check_code(){
    var abc = draw_ace();

    if((task_number==0)||(task_number==1)||(task_number==5)){

        var answer = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
        for(var iii = 0; iii<4;iii++){
            for(var jjj = 0; jjj<5;jjj++){
                answer[iii][jjj] = abc.matrix[iii*5+jjj];
            }
        }
        abc.matrix = answer;
        if(task_number==0){
            var results = check_desicion(result_min_sum, abc);
        } else if(task_number==1){
            var results = check_desicion(result_north_west, abc);
        } else if(task_number==5){
            var results = check_desicion(result_potential, abc);
        }

        var res_matrix = results.matrix;
        console.log(res_matrix);
        console.log(results.sum);

        var lines = iframeDoc.querySelectorAll('tr');
        for(var iii = 0; iii<lines.length;iii++){
            var columnes = lines[iii].querySelectorAll('td');
            for(var jjj = 0; jjj<columnes.length;jjj++){
                columnes[jjj].style.backgroundColor = 'green';
            }
        }
        var inp = iframeDoc.querySelector('input');
        inp.style.backgroundColor = "green";

        if(res_matrix.length!=1){
            for(var i = 0; i<res_matrix.length; i++){
                var lines = iframeDoc.querySelectorAll('tr');
                var columnes = lines[Math.floor(res_matrix[i]/10)].querySelectorAll('td');
                columnes[res_matrix[i]%10].style.backgroundColor = 'red';
            }
        }

        if(results.sum!=0){
            inp.style.backgroundColor = "red";
        }

        if((results.sum==0)&&(res_matrix==0)){
            console.log("aaa");
            document.querySelector('.nexttask').disabled = false;
        }

    }



}
document.querySelector('.drawcode').addEventListener('click',draw_ace);
// document.querySelector('.drawcode').addEventListener('click',try_sigma);
document.querySelector('.sendcode').addEventListener('click',check_code);

function try_sigma(user_answer){

    if(typeof user_answer!="undefined"){
        var abc = user_answer.matrix;
    }

    document.getElementById('container').innerHTML = "";

    var g = {
        nodes: [],
        edges: []
    };

    for (i = 0; i < 4; i++)
        g.nodes.push({
            id: 'c' + i,
            label: 'Consumer ' + (i+1)+': '+consumer[i],
            x: 10+15*i,
            y: 5,
            size: consumer[i],
            color: '#000'
        });

    for (i = 0; i < 5; i++)
        g.nodes.push({
            id: 's' + i,
            label: 'Storage ' + (i+1)+': '+storage[i],
            x: 10+10*i,
            y: 15,
            size: storage[i],
            color: '#00f'
    });
    for (i = 0; i < 4; i++){
            for (var j = 0; j < 5; j++){
                var color_edge = '#ccc';
                var label_edge = '';
                if(typeof abc !="undefined"){
                    if(abc[i*5+j]!=0){
                        color_edge = '#0f0';
                        label_edge = abc[i*5+j];
                    }
                }

                g.edges.push({
                    id: 'e' + (i*5+j),
                    source: 'c' + i,
                    target: 's' + j,
                    size: 1,
                    label: label_edge,
                    color: color_edge
                });
        }
    }
    var s = new sigma({
        graph: g,
        renderer: {
            container: "container",
            type: "canvas"
        },
        settings: {
        }
    });

    return abc;
}

start_work();

//Начинаем работу с заданиями
function start_work(){

    resources = get_resources();
    tasks = resources.tasks;
    variants_array = resources.variants;
    task_number = get_task_number()-1;

    start_task(resources, task_number, tasks, variants_array);
}

//Получает данные для данного задания и отправляет формировать интерфейс
function start_task(resources, task_number, tasks, variants_array){

    task_array = tasks[task_number];

    document.querySelector('.prevtask').addEventListener('click',prev_task);
    document.querySelector('.nexttask').addEventListener('click',next_task);
    // document.querySelector('.prevtask').disabled = 'false';
    // document.querySelector('.nexttask').disabled = 'false';

    iframe = document.querySelector('#matrixframe');
    iframeDoc = iframe.contentWindow.document.body;
    if((task_number==0)||(task_number==1)||(task_number==5)){
        iframeDoc.innerHTML = "<label> Сумма: <input type = text readonly></label><table><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></table>";
    } else if(task_number==2){
        iframeDoc.innerHTML = "<p>U = <table class = 'task3'><tr><td></td><td></td><td></td><td></td></tr></table></p><p>V = <table class = 'task3'><tr><td></td><td></td><td></td><td></td><td></td></tr></table></p>";
    } else if((task_number==3)||(task_number==4)){
        iframeDoc.innerHTML = "<table><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td><td></td></tr></table>";
    }

    var cssLink = document.createElement("link");
    cssLink.href = "styleframes.css";
    cssLink.rel = "stylesheet";
    cssLink.type = "text/css";
    iframeDoc.appendChild(cssLink);

    if(typeof variant=="undefined"){
        variant = generate_variant(variants_array);
    }
    document.querySelector('.nexttask').disabled = true;

    if(task_number==0){
        document.querySelector('.prevtask').removeEventListener('click',prev_task);
        document.querySelector('.prevtask').disabled = true;
    } else{
        document.querySelector('.prevtask').disabled = false;
    }

    if (task_number==tasks.length-1) {
        document.querySelector('.nexttask').removeEventListener('click',next_task);
        document.querySelector('.nexttask').addEventListener('click',finish);
    }

    task = variant.task;
    consumer = variant.consumer;
    storage = variant.storage;
    storage_sum = variant.storage_sum;

    fill_interface(task_array, variant);
}

//Заполняет интерфейс данными для этого задания
function fill_interface(task_array, variant){

     document.querySelector('.instruction').innerHTML = task_array.task_text;
     document.querySelector('.pop_up p').innerHTML = task_array.popup_text;
     document.querySelector('.matrixarea p').innerHTML = task_array.desicion_text;

     var lines = document.querySelectorAll('.taskmatrix tr');
     for(var iii = 0; iii<lines.length;iii++){
         var columnes = lines[iii].querySelectorAll('td');
         if(iii==lines.length-1){
             for(var jjj = 0; jjj<columnes.length-1;jjj++){
                 columnes[jjj].innerHTML = variant.storage[jjj];
             }
         }else{
             for(var jjj = 0; jjj<columnes.length-1;jjj++){
                 columnes[jjj].innerHTML = variant.task[iii][jjj];
             }
             columnes[columnes.length-1].innerHTML = variant.consumer[iii];
         }
     }

     editor.setValue(task_array.ace);
     try_sigma();
}

//Возвращает случайный вариант задания (для первого задания)
function generate_variant(variants_array){
    variant_number = Math.floor(Math.random() * variants_array.length);
    resources['variant'] = variants_array[variant_number];
    return(variants_array[variant_number]);
}

get_start_values(resources);

var result_min_sum = get_desicion_min_sum(task, consumer, storage, storage_sum);

get_start_values(resources);
var result_north_west = get_desicion_north_west(task, consumer, storage, storage_sum);

// check_desicion(real_min_sum, result_min_sum);
// document.write("NOW!<br>");
// document.write(result_north_west.route+"<br>");
// check_desicion(real_north_west, result_north_west);

get_start_values(resources);
var column_potentials = get_column_potentials(task,result_north_west.route);

get_start_values(resources);
var matrix_potentials = get_matrix_potentials(column_potentials.upper, column_potentials.left);

get_start_values(resources);
var result_potential = change_route(task, matrix_potentials, result_north_west);

// document.write(result_potential.matrix);
// check_desicion(real_potential, result_potential);
 // document.write(resources.variants[1].storage);

//Читает JSON-файл с данными для заданий и парсит. Возвращает JSON-объект
function get_resources() {
  return resources;
}

//Достает код и редактора и заставляет его работать. Создаются переменные, записанные в коде
function execute_ace(){
	return editor.getValue();
}

//Возвращает номер задания из адресной строки
function get_task_number() {
  var index = window.location.hash;
  task_number = parseInt(index.replace('#',''));
  return task_number;
}

//Изменяет номер задания в адресной строке
function update_task_number(index) {
  window.location.hash = index;
}

//Находит ячейку с наибольшей разницей между стоимостью перевозки и потенциалом и меняет маршрут для уменьшения суммы. Возвращает JSON с полями matrix и sum
function change_route(task,matrix_potentials, result_north_west){
	var route = result_north_west.route;
	var max_dif = 0;
	var x = 0;
	var y = 0;

	for (var i = 0; i<4; i++){
		for (var j = 0; j<5; j++){
			var dif = matrix_potentials[i][j] - task[i][j];
			if(dif>max_dif){
				max_dif = dif;
				x = i;
				y = j;
			}
		}
	}

	var variants = [];

	for(var i = 0; i<route.length;i++){
		if((route[i][0]==x)||(route[i][1]==y)){
			variants.push(route[i]);
		}
	}

	var changing_cell_num = 0;
	var got_variant_1 = 0;
	var got_variant_2 = 0;
	for(var i = 0; i<variants.length; i++){
		for(var j = 0; j<variants.length; j++){
			var variant_i_x = variants[i][0];
			var variant_i_y = variants[i][1];
			var variant_j_x = variants[j][0];
			var variant_j_y = variants[j][1];
			if((variant_i_x!=variant_j_x)&&(variant_i_y!=variant_j_y)){
				for(var k = 0; k<route.length;k++){
					if(((route[k][0]==variant_i_x)&&(route[k][1]==variant_j_y))||((route[k][0]==variant_j_x)&&(route[k][1]==variant_i_y))){
						if((route[k][0]!=x)&&(route[k][1]!=y)){
							changing_cell_num = route[k];
							got_variant_1 = variants[i];
							got_variant_2 = variants[j];
						}
					}
				}
			}
		}
	}

	var goods_first = result_north_west.matrix[got_variant_1[0]][got_variant_1[1]];
	var goods_second = result_north_west.matrix[got_variant_2[0]][got_variant_2[1]];

	var min_goods = (goods_first<goods_second?goods_first:goods_second);

	result_north_west.matrix[got_variant_1[0]][got_variant_1[1]] = result_north_west.matrix[got_variant_1[0]][got_variant_1[1]] - min_goods;
	result_north_west.matrix[got_variant_2[0]][got_variant_2[1]] = result_north_west.matrix[got_variant_2[0]][got_variant_2[1]] - min_goods;
	result_north_west.matrix[changing_cell_num[0]][changing_cell_num[1]] = result_north_west.matrix[changing_cell_num[0]][changing_cell_num[1]] + min_goods;
	result_north_west.matrix[x][y] = result_north_west.matrix[x][y] + min_goods;

	var res_sum = 0;
	for(var i = 0; i<4; i++){
		for(var j = 0; j<5; j++){
			res_sum+=result_north_west.matrix[i][j]*task[i][j];
		}
	}

	var result = {
		"matrix": result_north_west.matrix,
		"sum": res_sum
	};

    return result;
}

//Возвращает матрицу потенциалов для исходных данных
function get_matrix_potentials(upper, left){

	var result = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];

	for (var i = 0; i<4; i++){
		for (var j = 0; j<5; j++){
			result[i][j] = left[i]+upper[j];
		}
	}

	return result;

}

//Возвращает массивы потенциалов для столбцов и строк для исходных данных
function get_column_potentials(task,route){
	var upper = [-1,-1,-1,-1,-1];
	var left = [-1,-1,-1,-1];

	left[0] = 0;

	var route_walker = 0;
	while(route_walker<route.length){
		var x = route[route_walker][0];
		var y = route[route_walker][1];

		if(left[x]!=-1){
			upper[y] = task[x][y] - left[x];
		} else if(upper[y]!=-1){
			left[x] = task[x][y] - upper[y];
		}

		route_walker++;
	}

	var result = {
		"upper": upper,
		"left": left
	}

	return result;
}

//Сверяет JSONы реального решения и полученного с помощью алгоритма
function check_desicion(real_result, user_result){

    console.log("my: "+real_result.matrix);
    console.log("des: "+user_result.matrix);

	if(check_matrix(real_result.matrix,user_result.matrix).length==0){
		console.log("Matrix gone");
		console.log("<br>");
		if(real_result.sum==user_result.sum){
			console.log("Sum also gone!");
			console.log("<br>");
            var result = {
                "matrix": 0,
                "sum": 0
            }
		} else{
			console.log("Sum not gone!");
			console.log("<br>");
            var result = {
                "matrix": 0,
                "sum": 1
            }
		}
	} else{
		console.log("Matrix not gone!");
	    console.log("<br>");
		console.log(check_matrix(real_result.matrix,user_result.matrix));
        var result = {
            "matrix": check_matrix(real_result.matrix,user_result.matrix),
            "sum": 1
        }
	}

    return result;
}

//Проверяет две матрицы размерности 4*5 и возвращает массив. Если массив пуст - матрицы равны, если не пуст - там лежат номера неравных ячеек
function check_matrix(matrix1, matrix2){
	var result = [];

	for (var i = 0; i<4; i++){
		for (var j = 0; j<5; j++){
			if(matrix1[i][j]!=matrix2[i][j]){
				result.push(i*10+j);
			}
		}
	}

	return result;
}

//Реализует метод северо-западного угла по исходным данным. Возвращает JSON с полями matrix, sum, route (маршрут прохода по таблице)
function get_desicion_north_west(task, consumer, storage, storage_sum){

	var task_now = task;
	var consumer_now = consumer;
	var storage_now = storage;

	var left = storage_sum;
	var count = 0;
	var result_sum = 0;
	var result_matrix = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
	var result_route = [];

    var x = 0;
    var y = 0;

	do{
        var consumer_have = consumer_now[x];
        var storage_have = storage_now[y];
        if((consumer_have!=0)&&(storage_have!=0)){
			result_route.push([x,y]);
	        if(consumer_have<storage_have){
	            result_sum+=task_now[x][y]*consumer_have;
	            left = left-consumer_have;
	            storage_now[y] = storage_now[y] - consumer_now[x];
	            result_matrix[x][y] = consumer_have;
	            consumer_now[x]=0;
	            x++;
	        }else{
	            result_sum+=task_now[x][y]*storage_have;
	            left = left-storage_have;
	            consumer_now[x] = consumer_now[x] - storage_now[y];
	            result_matrix[x][y] = storage_have;
	            storage_now[y]=0;
	            y++;
	        }
        }
	    count = count +1;
	} while((left>0)&&(count<20)&&(x<4)&&(y<5));

	var result = {
		"matrix": result_matrix,
		"sum": result_sum,
		"route": result_route
	};

    return result;
}

//Реализует метод наименьшей стоимости по исходным данным. Возвращает JSON с полями matrix и sum
function get_desicion_min_sum(task, consumer, storage, storage_sum){

	var task_now = task;
	var consumer_now = consumer;
	var storage_now = storage;

	var left = storage_sum;
	var count = 0;
	var result_sum = 0;
	var result_matrix = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];

	do{
		var min = 100;
	    var x = -1;
	    var y = -1;
	    for (var i = 0; i<4; i++){
	    	for (var j = 0; j<5; j++){
	            if ((consumer_now[i]!=0)&&(storage_now[j]!=0)){
	            	if((task_now[i][j]>0)&&(task_now[i][j]<min)){
	                	min = task_now[i][j];
	                    x = i;
	                    y = j;
	                }
	            }
	        }
	    }

	    if((x == -1)||(y == -1)){
	    	document.writeln("ERROR!");
	    }else{
	    task_now[x][y]=0;

	    if(consumer_now[x]<storage_now[y]){
	        result_sum+=min*consumer_now[x];
	        left = left-consumer_now[x];
	        storage_now[y] = storage_now[y] - consumer_now[x];
			result_matrix[x][y] = consumer_now[x];
	        consumer_now[x]=0;
	    }else{
	        result_sum+=min*storage_now[y];
	        left = left-storage_now[y];
	        consumer_now[x] = consumer_now[x] - storage_now[y];
			result_matrix[x][y] = storage_now[y];
	        storage_now[y]=0;
	    }

	    }
	    count = count +1;
	} while((left>0)&&(count<20));

	var result = {
		"matrix": result_matrix,
		"sum": result_sum
	};

	return result;
}

//Возвращает исходные данные (пока так)
function get_start_values(resources){

    task = [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]];
    consumer = [0,0,0,0];
    storage = [0,0,0,0,0];
    storage_sum = 0;

    for (var i = 0; i<4; i++){
        for (var j = 0; j<5; j++){
            task[i][j] = resources.variants[variant_number].task[i][j];
        }
    }

    for (var i = 0; i<4; i++){
        consumer[i] = resources.variants[variant_number].consumer[i];
    }

    for (var i = 0; i<5; i++){
        storage[i] = resources.variants[variant_number].storage[i];
        storage_sum +=storage[i];
    }

}


//Кнопочка для pop_up в начале заданий
document.querySelector('.close_pop_up').addEventListener('click', function(){
    document.querySelector('.main').classList.remove('darkened');
    document.querySelector('.pop_up').classList.add('closed');
});

//Кнопочка для возврата редактора в начальное состояние (с шаблоном)
document.querySelector('.clearcode').addEventListener('click', function(){
    editor.setValue(task_array.ace);
});
