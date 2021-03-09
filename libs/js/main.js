$('document').ready(() =>{
	
	//global variables
	let users = [];
	let i = 0;
	let state = {
		'like': "",
		'orderCriteria': "p.lastName",
		'searchBy': "p.lastName"
	}
	let UserId;

	function removeUnderlined(target) {
		$('#pLastName, #pEmail, #pJobTitle, #dName, #lName').removeClass('underlined');
		$(target).addClass('underlined');
	}

	function clearTable(total) {
		for(let i = 0; i < 100; i++) {
			$(`#user${i}`).remove();
		}
	}
	$('.exitButton').on('click', () => {
		$('.userLayout').trigger('click');
	});
	$('.okBtn').on('click', () => {
		$('.successTextMessage').text(``);
		$('.failedTextMessage').text(``);
		$('.successDialogBox').addClass('hidden');
		$('.failDialogBox').addClass('hidden');
	});
	function showSuccess(text) {
		$('.successTextMessage').text(`${text}`);
		$('.successDialogBox').removeClass('hidden');
	}
	function showFailed(text) {
		$('.failedTextMessage').text(`${text}`);
		$('.failDialogBox').removeClass('hidden');
	}

	//main request 
	function orderBy(state) {
		$.ajax({
			url: "libs/php/getAll.php",
			type: 'POST',
			dataType: 'json',
			data: state,
			success: (result) => {

				clearTable(result['data'].length);
			    i = 0;
				result['data'].forEach(elem => {
				
					let row = `
					<tr id=${'user'+i} class="trData">
						<td class="tableData"><span class="fnam">${elem.lastName}</span> ${elem.firstName}</td>
						<td class="tableData hideCell">${elem.email}</td>
						<td class="tableData hideCell">${elem.jobTitle}</td>
						<td class="tableData hideCell">${elem.department}</td>
						<td class="tableData">${elem.location}</td>
						<td style="display: none;" class="tableData">${elem.id}</td>
						<td style="display: none; class="tableData">${elem.departmentID}</td>
					</tr>`;
					
					$('.tableBody').append(row);
					i++;
		
				});
	
				$(".tableBody").on('click', 'tr', function() {
					$('.edit').removeClass('hidden');

					user = {
						'firstName': $(this).find('td').eq('0').text().split(" ")[1],
						'lastName': $(this).find('td').eq('0').text().split(" ")[0],
						'email': $(this).find('td').eq('1').text(),
						'jobTitle': $(this).find('td').eq('2').text(),
						'department': $(this).find('td').eq('3').text(),
						'location': $(this).find('td').eq('4').text(),
						'id': $(this).find('td').eq('5').text(),
						'depId': $(this).find('td').eq('6').text()
					}
					
					loadUser(user);
				});

			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log(jqXHR);
			}
		});
	}
	
	orderBy(state);

    
	//load user, edit and remove

	async function loadUser(usr) {

		//set edit user dialog inputs/placeholders
		$('#editUserFirstName').attr('placeholder', usr['firstName']); 
		$('#editUserLastName').attr('placeholder', usr['lastName']);
		$('#editUserEmail').attr('placeholder', usr['email']);
		$('#editUserJobTitle').attr('placeholder', usr['jobTitle']);

		//get all departments in order to display them in the select list
		$('#editUserDepartment').find('option').remove();
		let retrievedDepartments = await getAllDepartments();
		retrievedDepartments.forEach(elem => {
			$('#editUserDepartment').append(`<option value="${elem['id']}">${elem['name']}</option>`);
		});
		$('#editUserDepartment').val(usr['depId']); //set selected value to user's current department

		//get department location
		$('#editUserDepartment').on('change', async (event) => {
	        let locationName = await getDepartmentLocation($(event.currentTarget).val());
		    $('#editUserLocation').text(locationName);
		});

		$('#editUserDepartment').trigger('change'); 

		UserId = usr['id'];
	}

	function edit() {
		$('.loadingLayer').removeClass('hidden');
		
		//check if inputs are empty - if so, place the placeholders value to actual input value
		if(!$('#editUserFirstName').val()) {
			$('#editUserFirstName').val($('#editUserFirstName').attr('placeholder'));
		} 
		if(!$('#editUserLastName').val()) {
			$('#editUserLastName').val($('#editUserLastName').attr('placeholder'));
		}
		if(!$('#editUserEmail').val()) {
			$('#editUserEmail').val($('#editUserEmail').attr('placeholder'));
		}
		if(!$('#editUserJobTitle').val()) {
			$('#editUserJobTitle').val($('#editUserJobTitle').attr('placeholder'));
		}

		$.ajax({
			url: "libs/php/editUser.php",
			type: 'POST',
			dataType: 'json',
			data: {
				'id': UserId,
				'firstName': $('#editUserFirstName').val(),
				'lastName': $('#editUserLastName').val(),
				'email': $('#editUserEmail').val(),
				'jobTitle': $('#editUserJobTitle').val(),
				'department': $('#editUserDepartment').val()
			},
			success: (result) => {

				orderBy(state);
				
				$('.loadingLayer').addClass('hidden'); //clear loading animation
				$('.editUserConfirm').addClass('hidden'); //remove edit-user confirm dialog
				$('.editUserLayout').addClass('hidden'); //remove enitre user dialog layout

				//clear fields after editing user
				$('.userLayout').trigger('click');

				showSuccess('User edited');
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log(jqXHR);
			}
		});
	
	}

	async function getAllDepartments() {
		let departments = [];
		await $.ajax({
			url: "libs/php/getAllDepartments.php",
			type: 'POST',
			dataType: 'json',
			data: {},
			success: (result) => {
		
				departments = result['data'];

			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log(jqXHR);
			}
		});
		return departments;
	}

	async function getDepartmentLocation(departmentId){
		let locationName;
		await $.ajax({
			url: "libs/php/getLocationById.php",
			type: 'POST',
			dataType: 'json',
			data: {
				'departmentId': departmentId
			},
			success: (result) => {
	
				locationName = result['data']['0']['name'];

			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log(jqXHR);
			}
		});
		return locationName;
	}

	function removeUser() {
		$('.loadingLayer').removeClass('hidden');
		$.ajax({
			url: "libs/php/removeUser.php",
			type: 'POST',
			dataType: 'json',
			data: {
				'id': UserId,
			},
			success: (result) => {
		
				orderBy(state);
				$('.loadingLayer').addClass('hidden');
				$('.remUserConfirm').addClass('hidden');
				$('.userLayout').addClass('hidden');
				showSuccess('User removed');

			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log(jqXHR);
			}
		});
	}

	
//order by th 
	$('#pLastName').on('click', (event) => {
		state['orderCriteria'] = 'p.lastName';
		orderBy(state);
		removeUnderlined($(event.currentTarget));
	});
	$('#pEmail').on('click', (event) => {
		state['orderCriteria'] = 'p.email';
		orderBy(state);
		removeUnderlined($(event.currentTarget));
	});
	$('#pJobTitle').on('click', (event) => {
		state['orderCriteria'] = 'p.jobTitle';
		orderBy(state);
		removeUnderlined($(event.currentTarget));
	});
	$('#dName').on('click', (event) => {
		state['orderCriteria'] = 'd.name';
		orderBy(state);
		removeUnderlined($(event.currentTarget));
	});
	$('#lName').on('click', (event) =>  {
		state['orderCriteria'] = 'l.name';
		orderBy(state);
		removeUnderlined($(event.currentTarget));
	});
	$('#searchByVal').on('change keydown paste input', (event)=> {
		state['like'] = $(event.currentTarget).val();
		state['searchBy'] = $('#orderBy').val();
		orderBy(state);
	});

	//clear add user/edit user form fields
	$('.userLayout').on('click', (event) => {
		$(event.currentTarget).addClass('hidden');
		$('#editUserFirstName').val("");
		$('#editUserLastName').val("");
		$('#editUserEmail').val("");
		$('#editUserJobTitle').val("");
		$('#editUserDepartment').val("");
		$('#editUserLocation').val("");

		$('#addUserFirstName').val("");
		$('#addUserLastName').val("");
		$('#addUserEmail').val("");
		$('#addUserJobTitle').val("");
		$('#addUserDepartment').val("");
		$('#addUserLocation').val("");

		$('#addDepartmentName').val("");
	});
	$('.editUserForm').on('click', (event) => {
		event.stopPropagation();
	});

	//edit and remove users event listener
	$('#editUserBtn').on('click', () => { $('.editUserConfirm').removeClass('hidden'); });
	$('#yesConfirmEditUser').on('click', () => { edit(); });
	$('#noConfirmEditUser').on('click', () => { $('.editUserConfirm').addClass('hidden'); })

	$('#removeUserBtn').on('click', () => { $('.remUserConfirm').removeClass('hidden'); });
	$('#yesConfirmRemoveUser').on('click', () => { removeUser(); });
	$('#noConfirmRemoveUser').on('click', () => { $('.remUserConfirm').addClass('hidden'); })

	//add user event listener + function
	$('#addUser').on('click', async () => {
		$('#addUserDepartment').find('option').remove();
		$('.add').removeClass('hidden');
		let retrievedDepartments = await getAllDepartments();
		retrievedDepartments.forEach(elem => {
			$('#addUserDepartment').append(`<option value="${elem['id']}">${elem['name']}</option>`);
		});
		$('#addUserDepartment').on('change', async (event) => {
	        let locationName = await getDepartmentLocation($(event.currentTarget).val());
		    $('#addUserLocation').text(locationName);
		});
		$('#addUserDepartment').trigger('change');
	});
	$('#submitAddUserBtn').on('click', () => {
		let checkFields = "";
		let insertable = true;
		if(!$('#addUserFirstName').val()) {
			checkFields += "First name is missing.\n";
			insertable = false;
		}
		if(!$('#addUserLastName').val()) {
			checkFields += "Last name is missing.\n";
			insertable = false;
		}
		if(!$('#addUserEmail').val()) {
			checkFields += "User email is missing.\n";
			insertable = false;
		}
		if(!$('#addUserJobTitle').val()) {
			checkFields += "Job title is missing.\n";
			instertable = false;
		}
		if(insertable === false) {
			showFailed(checkFields);
		} else {
			let user = {
				'firstName': $('#addUserFirstName').val(),
				'lastName': $('#addUserLastName').val(),
				'email': $('#addUserEmail').val(),
				'jobTitle': $('#addUserJobTitle').val(),
				'department': $('#addUserDepartment').val(),
			};
			insertUser(user);
		}
	});
	function insertUser(usr) {
		$('.loadingLayer').removeClass('hidden');
		$.ajax({
			url: "libs/php/insertUser.php",
			type: 'POST',
			dataType: 'json',
			data: usr,
			success: (result) => {
				$('.loadingLayer').addClass('hidden');
			},
			error: (jqXHR, textStatus, errorThrown) => {
				orderBy(state);
				$('.loadingLayer').addClass('hidden'); //clear loading animation
				$('.editUserConfirm').addClass('hidden'); //remove edit-user confirm dialog
				$('.editUserLayout').addClass('hidden'); //remove enitre user dialog layout

				//clear fields after editing user
				$('.userLayout').trigger('click');

				showSuccess('User added successfully');
			}
		});
	}

	//add department event listener + function
	async function getAllLocations() {
		let locations = [];
		await $.ajax({
			url: "libs/php/getAllLocations.php",
			type: 'POST',
			dataType: 'json',
			data: {},
			success: (result) => {
				locations = result['data'];
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log('failed getting locations');
			}
		});
		return locations;
	}
	async function checkDepartementLocation(depName, depLocationId) {
		let exists = false;
		await $.ajax({
			url: "libs/php/getDepartmentByName.php",
			type: 'POST',
			dataType: 'json',
			data: {
				'depName': depName,
				'depLocationId': depLocationId
			},
			success: (result) => {
				console.log(result);
				if(result['data'].length > 0) {
					exists = true;
				}
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log('failed getting locations');
			}
		});
		return exists;
	}
	function insertDepartment(department) {
		$('.loadingLayer').removeClass('hidden');
		$.ajax({
			url: "libs/php/insertDepartment.php",
			type: 'POST',
			dataType: 'json',
			data: department,
			success: (result) => {
				$('.userLayout').trigger('click');
				$('.loadingLayer').addClass('hidden');
				showSuccess('Department added successfully');
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log('failed getting locations');
			}
		});
	}
	$('.addDepartmentForm').on('click', (event) => {
		event.stopPropagation();
	});
	$('#addDepartment').on('click', async () => {
		$('.addDep').removeClass('hidden');
		let locations = await getAllLocations();
		locations.forEach(elem => {
			$('#addDepartmentLocation').append(`<option value="${elem['id']}">${elem['name']}</option>`);
		});
	});
	$('#submitAddDepartmentBtn').on('click', async () => {
		let name =  $('#addDepartmentName').val();
		let locationID = $('#addDepartmentLocation').val();
		console.log(name + " " + locationID);
		if(!name) {
			showFailed("Department filed is empty. Please insert department name");
			$('#addDepartmentName').val("");
		} else {
			if( await checkDepartementLocation(name, locationID)) {
				showFailed("This department is already inserted in the database on this location. Please select another location or add a different department");
			} else {
				let department = {
					'name': name,
					'locationID': locationID
				}
				insertDepartment(department);
			}
		}
	});

	//remove department event listener + function 
	async function checkIfPeopleInDepartment(department) {
		let found = false;
		await $.ajax({
			url: "libs/php/getPoepleByDepartment.php",
			type: 'POST',
			dataType: 'json',
			data: {
				depID: department
			},
			success: (result) => {
				if(result['data'].length > 0) {
					found = true;
				}
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log('failed getting locations');
			}
		});
		return found;
	}
	function deleteDepartment(depID) {
		$('.loadingLayer').removeClass('hidden');
		$.ajax({
			url: "libs/php/deleteDepartmentByID.php",
			type: 'POST',
			dataType: 'json',
			data: {
				depID: depID
			},
			success: (result) => {
				$('.remDep').addClass('hidden');
				showSuccess('Department deleted');
				$('.loadingLayer').addClass('hidden');
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log('Could not delete department. Please try again!');
			}
		});
	}

	$('#removeDepartmentR').on('click', async () => { 
		$('#removeDepartment').find('option').remove();
		$('.remDep').removeClass('hidden');
		let departments = await getAllDepartments();
		departments.forEach(elem => {
			$('#removeDepartment').append(`<option value="${elem['id']}">${elem['name']}</option>`);
		});
	});
	$('#submitRemoveDepartmentBtn').on('click', async () => {
		if(await checkIfPeopleInDepartment($('#removeDepartment').val())) {
			showFailed("You can't remove this department as there are people asigned to it.");
		} else {
			deleteDepartment($('#removeDepartment').val());
		}
	});

	//add location event listener + function 
	async function checkIfLocationExists(location) {
		let exists = false;
		await $.ajax({
			url: "libs/php/getLocationByName.php",
			type: 'POST',
			dataType: 'json',
			data: {
				'name': location
			},
			success: (result) => {
				if(result['data'].length > 0) {
					exists = true;
				}
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log('failed getting locations');
			}
		});
		return exists;
	}
	function insertLocation(location) {
		$('.addLoc').addClass('hidden');
		$('.loadingLayer').removeClass('hidden');
		$.ajax({
			url: "libs/php/insertLocation.php",
			type: 'POST',
			dataType: 'json',
			data: {
				'name': location
			},
			success: (result) => {
				$('.loadingLayer').addClass('hidden');
				showSuccess("Location added to database");
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log('failed getting locations');
			}
		});
	}
	$('.addLocationForm').on('click', (event) => {
		event.stopPropagation();
	});
	$('#addLocation').on('click', () => {
		$('.addLoc').removeClass('hidden');
	});
	$('#submitAddLocationBtn').on('click', async () => {
		let locationName = $('#addLocationName').val();
		if(locationName) {
			if(await checkIfLocationExists(locationName)) {
				showFailed("This location was already added to database");
				$('#addLocationName').val("");
			} else {
				insertLocation(locationName);
			}
		} else {
			showFailed("Location name is missing");
		}
	});

	//remove location event listener + function 
	async function checkIfDepartmentInLocation(location) {
		let found = false;
		await $.ajax({
			url: "libs/php/getDepartmentByLocation.php",
			type: 'POST',
			dataType: 'json',
			data: {
				'locationID': location
			},
			success: (result) => {
				if(result['data'].length > 0) {
					found = true;
				}
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log('failed getting locations');
			}
		});
		return found;
	}
	function deleteLocation(locationID) {
		$('.loadingLayer').removeClass('hidden');
		$('.remLoc').addClass('hidden');
		$.ajax({
			url: "libs/php/deleteLocationByID.php",
			type: 'POST',
			dataType: 'json',
			data: {
				'locationID': locationID
			},
			success: (result) => {
				$('.loadingLayer').addClass('hidden');
				showSuccess("Location removed");
			},
			error: (jqXHR, textStatus, errorThrown) => {
				console.log('failed getting locations');
			}
		});
	}

	$('.removeLocationForm').on('click', (event) => {
		event.stopPropagation();
	});
	$('#removeLocationR').on('click', async () => {
		$('#removeLocationName').find('option').remove();
		let retrievedLocations = await getAllLocations();
		retrievedLocations.forEach(elem => {
			$('#removeLocationName').append(`<option value="${elem['id']}">${elem['name']}</option>`);
		});
		$('.remLoc').removeClass('hidden');
	});
	$('#submitRemoveLocationBtn').on('click', async () => {
		let locationID = $('#removeLocationName').val();
		if(await checkIfDepartmentInLocation(locationID)) {
			showFailed("You can't remove this location as there are departments assigned to it.");
		} else {
			deleteLocation(locationID);
		}
	});

	//set displayed data section height
	function setSectionHeight(param, margin) {
		let substractHeight = $(`${param}`).height() + $('.editPlusMenu').height() + margin;
		$('.displayData').attr('style', `height: calc(100vh - ${substractHeight}px)`);
	}
	$(window).on("resize", () => {
		$(this).width() > 1000 ? setSectionHeight('.header', 60) : setSectionHeight('.header', 70);	
	});	
	$(this).width() > 1000 ? setSectionHeight('.header', 60) : setSectionHeight('.header', 70);

});