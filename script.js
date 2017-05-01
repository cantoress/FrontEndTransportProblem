var task = 0;
var consumer = 0;
var storage = 0;
var storage_sum = 0;
var resources = 0;

get_start_values();

var result_min_sum = get_desicion_min_sum(task, consumer, storage, storage_sum);

get_start_values();
var result_north_west = get_desicion_north_west(task, consumer, storage, storage_sum);

// check_desicion(real_min_sum, result_min_sum);
// document.write("NOW!<br>");
// document.write(result_north_west.route+"<br>");
// check_desicion(real_north_west, result_north_west);

get_start_values();
var column_potentials = get_column_potentials(task,result_north_west.route);

get_start_values();
var matrix_potentials = get_matrix_potentials(column_potentials.upper, column_potentials.left);

get_start_values();
var result_potential = change_route(task, matrix_potentials, result_north_west);
// check_desicion(real_potential, result_potential);

//Читает JSON-файл с данными для заданий и парсит. Возвращает JSON-объект
function get_resources() {
  getJSON = loadJSON('resources.json');
  resources = JSON.parse(getJSON);
  return resources;
}

function execute_ace(){
	document.write("<script>"+editor.getValue()+"</script>");
}

//Возвращает номер задания из адресной строки
function get_task_number() {
  index = window.location.hash;
  return parseInt(index.replace('#',''));
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

	if(check_matrix(real_result.matrix,user_result.matrix).length==0){
		document.write("Matrix gone");
		document.write("<br>");
		if(real_result.sum==user_result.sum){
			document.write("Sum also gone!");
			document.write("<br>");
		} else{
			document.write("Sum not gone!");
			document.write("<br>");
		}
	} else{
		document.write("Matrix not gone!");
		document.write("<br>");
		document.write(check_matrix(real_result.matrix,user_result.matrix));
	}

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
function get_start_values(){

	task = [[3,1,4,3,7],[1,2,6,8,3],[9,1,6,4,5],[2,4,2,1,5]];
	consumer = [60,15,20,30];
	storage = [15,40,10,15,45];
	storage_sum = 125;

}
