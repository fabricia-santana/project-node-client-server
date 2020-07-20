class UserController{

    constructor(formIdCreate,formIdUpdate, tableId){
        this.formCreateE1 = document.getElementById(formIdCreate);
        this.formUpdateE1 = document.getElementById(formIdUpdate);
        this.tableE1 = document.getElementById(tableId);
        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit(){
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate();
        });

        this.formUpdateE1.addEventListener("submit", e =>{
            
            let btn = this.formUpdateE1.querySelector("[type=submit]")
            let value = this.getValues(this.formUpdateE1);
            let index = this.formUpdateE1.dataset.trIndex;
            let tr = this.tableE1.rows[index];
            let userOld = JSON.parse(tr.dataset.user);
            let result = Object.assign({}, userOld, value);

            e.preventDefault();
            btn.disabled = true;

            this.getPhoto(this.formUpdateE1).then(
                (content)=>{
                    if(!value.photo){
                        result._photo = userOld._photo;
                    }else{
                        result._photo = content;
                    }
                    let user = new User();
                    user.loadFromJSON(result);
                    user.save().then(user=>{

                        tr = this.getTr(user, tr);                    
                        this.addEventsTR(tr);
                        this.updateCount();                   
                        btn.disabled = false;
                        this.formUpdateE1.reset();
                        this.showPanelCreate();
                    });
            }, (e) =>{
                console.error(e);
            });
        });
    }

    getTr(dataUser, tr = null){

        if(tr === null){
            tr = document.createElement('tr');
        }
        tr.dataset.user = JSON.stringify(dataUser);
        
        tr.innerHTML = `<td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
                    <td>${dataUser.name}</td>
                    <td>${dataUser.email}</td>
                    <td>${(dataUser.admin)? 'Sim' : 'Não'}</td>
                    <td>${Utils.dateFormat(dataUser.register)}</td>
                    <td>
                    <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                    <button type="button" class="btn btn-danger btn-delete  btn-xs btn-flat">Excluir</button>
                    </td>`;
        this.addEventsTR(tr);
        return tr;
    }
  
    onSubmit(){

        this.formCreateE1.addEventListener("submit", event =>{
            
            let value = this.getValues(this.formCreateE1);
            let btn = this.formCreateE1.querySelector("[type=submit]")
            event.preventDefault();
            btn.disabled = true;
            
            if(!value) {
                return false;
            }

            this.getPhoto(this.formCreateE1).then(
                (content)=>{
                    value.photo = content;
                    value.save().then(user=>{

                        this.addLine(user);
                        btn.disabled = false;
                        this.formCreateE1.reset();
                    });
            }, (e) =>{
                console.error(e);
            });

        });
    }

    getPhoto(formE1){
        return new Promise((resolve, reject)=>{
            let fileReader = new FileReader();
            let elements = [...formE1.elements].filter(item => {
                if(item.name == "photo"){
                    return item;
    
                };
            })
    
            let file = elements[0].files[0];
            fileReader.onload = ()=>{
                resolve(fileReader.result);
            };
            fileReader.onerror = (e) =>{
                reject(e);
            }
            if(file){
                fileReader.readAsDataURL(file);
            }else{
                resolve('dist/img/boxed-bg.jpg');
            }
        });
    }

    getValues(formE1){

        let user = {};

        let isValid = true;

        [...formE1.elements].forEach(field =>{

            if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value){
                
                field.parentElement.classList.add("has-error");
                isValid =  false;
            }

            if(field.name == "gender"){
                if(field.checked){
                    user[field.name] = field.value;
                }
                
            }else if(field.name == "admin"){
                user[field.name] = field.checked;
            }else{
                user[field.name] = field.value;

            }
        });

        if(!isValid){
            return false;    
        }
        return new User(user.name, user.gender, user.birth, user.country, user.email, user.passWord, user.photo, user.admin);

    }

    addLine(dataUser){
        let tr = this.getTr(dataUser);        
        this.tableE1.appendChild(tr);
        this.updateCount();

    }

    selectAll(){

        User.getUsersStorage().then(data =>{
            data.user.forEach(dataUser =>{
                let user = new User();
                user.loadFromJSON(dataUser);
                this.addLine(user);
            })

        });
      
    }

    showPanelCreate(){
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }
    
    showPanelUpdate(){
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
        
    }

    updateCount(){
        let numberUsers= 0;
        let numberAdmin = 0;

        [...this.tableE1.children].forEach(tr =>{
            numberUsers++;

            let user = JSON.parse(tr.dataset.user);
            if(user._admin){
                numberAdmin++;
            }
        })
        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-admin").innerHTML = numberAdmin;
    }

    addEventsTR(tr){

        tr.querySelector(".btn-delete").addEventListener("click", e =>{

            if(confirm("Deseja realmente excluir?")){
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.remove().then(data =>{
                    tr.remove();
                    this.updateCount();
                    
                });
            }

        });


        tr.querySelector(".btn-edit").addEventListener("click", e =>{
            let json = JSON.parse(tr.dataset.user);

            this.formUpdateE1.dataset.trIndex = tr.sectionRowIndex;

            for(let name in json){
                let field = this.formUpdateE1.querySelector("[name=" + name.replace("_","")+ "]");

                if(field){
                    switch(field.type){
                        case 'file':
                            continue;
                            break;
                        case 'radio':
                            field = this.formUpdateE1.querySelector("[name=" + name.replace("_","")+"][value="+ json[name]+"]");
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = json[name];                             
                            break;
                        default:
                            field.value = json[name];
                    }
                    
                    field.value = json[name];
                }

            }   
            this.formUpdateE1.querySelector(".photo").src = json._photo;
            this.showPanelUpdate();
        });

        this.tableE1.appendChild(tr);
        
    }

}
