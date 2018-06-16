import { Component, ViewChild } from '@angular/core';
import { Nav, Platform, AlertController, Loading, LoadingController} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { SviagensPage } from '../pages/sviagens/sviagens';
import { LoginPage } from '../pages/login/login';
import { AuthProvider } from '../providers/auth/auth';
import { ProfilePage } from '../pages/profile/profile';

import { BackgroundMode } from '@ionic-native/background-mode';
import { AudioProvider } from '../providers/audio/audio';

import firebase from 'firebase';
//import { FIREBASE_CREDENTIALS } from './credentials';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  //variaveis globais

  @ViewChild(Nav) nav: Nav;
  net;
  image = "assets/images/newUser-b.png";
  imageuid;
  imageCar;
  status = "Ficar online";
  user;
  rootPage: any;
  ativo = false;
  cor = "danger";
  ano;
  mes;
  dia;
  horas;
  minutos;
  segundos;
  dataNow;
  public loading: Loading;
  public off = false;
  name;
  pages: Array<{title: string, component: any, icon:any}>;
  public userProfile:firebase.database.Reference;
  public userProfile2:any;
  para = 0;
  constructor(public platform: Platform,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen,
              public authProvider: AuthProvider,
			  private backgroundMode: BackgroundMode,
			  public alertCtrl: AlertController,
			  public audio: AudioProvider,
			  public loadingCtrl: LoadingController) {
	  
	this.initializeApp();
  

  
	//firebase.initializeApp(FIREBASE_CREDENTIALS);
	
  this.audio.preload('tabSwitch', 'assets/audio/audio1.mp3');
  
			setTimeout(() => {

				this.timeout();

			},3000);
	  
    this.desconect();
    
	const unsubscribe = firebase.auth().onAuthStateChanged(user => {
		
		//verifica se o usuario ja esta logado
		
		if (!user) {
			this.rootPage = LoginPage;
			//unsubscribe();
			} else {
				this.user = user.uid;
				this.userProfile = firebase.database().ref(`/DriverProfile/${user.uid}`);
				this.getUserProfile().on("value", userProfileSnapshot => {
				if(userProfileSnapshot.val()){
				if(userProfileSnapshot.val().status != "off"){
					if(userProfileSnapshot.val().status.status == "aceito"){
					this.setBackground( "Você aceitou uma corrida","Va até o passageiro.");
					}
					if(userProfileSnapshot.val().status.status == "go"){
						this.setBackground( "Você iniciou uma corrida","Leve o passageiro ao seu destino.");
					}
					if(userProfileSnapshot.val().status.status == "stop"){
						this.setBackground("Você está ativo","Será notificado quando houver solicitações de viagens novas.",);
					}}
        		
        		this.authProvider.atualizar_versao(this.user);
				this.name = userProfileSnapshot.val().firstName + " " + userProfileSnapshot.val().lastName;
				this.userProfile2 = userProfileSnapshot.val();
				this.imageuid = userProfileSnapshot.val().imageuid;
				this.image = userProfileSnapshot.val().image;	
				this.imageCar = userProfileSnapshot.val().carro.imagecar;
				this.rootPage = HomePage;
				unsubscribe();
				}else{
					this.rootPage = LoginPage;
				}
				});
				
				
					}
	});

    // itens do menu
	  
    this.pages = [
      { title: 'Suas viagens', component: SviagensPage, icon:'albums' },
      { title: 'Perfil', component: 'perfil', icon:'contact' },
      { title: 'Sair', component: 'sair', icon:'close-circle' }
      
    ];
  }
    //recupera as informações do usuario do firebase
    getUserProfile(): firebase.database.Reference {
        //console.log('profile 2 ',this.userProfile);
		return this.userProfile;
	  }
  	initializeApp() {
    	this.platform.ready().then(() => {
      		// Okay, so the platform is ready and our plugins are available.
      		// Here you can do any higher level native things you might need.
      		this.statusBar.styleDefault();
      		this.splashScreen.hide();
			
    	});
    }

    DataAtual(){
      let ano = new Date().getFullYear();
			let mes:any = new Date().getMonth() + 1;
			if(mes < 10){
				mes = "0" + mes;
			}
			let dia:any = new Date().getDate();
			if(dia < 10){
				dia = "0" + dia;
			}
			let horas:any = new Date().getHours();
			if(horas < 10){
				horas = "0" + this.horas;
			}
			let minutos:any = new Date().getMinutes();
			if(minutos < 10){
				minutos = "0" + this.minutos;
			}
			let segundos:any = new Date().getSeconds();
			if(segundos < 10){
				 segundos = "0" + this.segundos;
      }
      let dataNow = { dataNow : ano + mes + dia + horas + minutos + segundos,
                      ano:ano,
                      mes:mes,
                      dia:dia,
                      horas:horas,
                      minutos:minutos,
                      segundos:segundos};

      return dataNow
      
    }
    
	//função para ativar e desativar modo background
	back(){
		
		this.ativo = !this.ativo;
		
		if(this.ativo == true ){
			
		    this.status = "Ficar offline";
			//console.log("ativo ",this.ativo);
			this.cor = "secondary";
			
			firebase.database().ref(`/DriverProfile/${this.user}/ver`).set(this.authProvider.getVer());
			
			let dataNow = this.DataAtual();
			
			//console.log(dataNow);
				
			this.authProvider.driveron(dataNow.dataNow,this.user,dataNow.horas,dataNow.minutos,dataNow.ano,dataNow.mes,dataNow.dia).then(() =>{
			this.dataHoje();
			});
			
			this.authProvider.setstatus(true);

			this.platform.ready().then(() => { 

			this.backgroundMode.enable();

			this.backgroundMode.on("activate").subscribe(()=>{
          this.backgroundMode.disableWebViewOptimizations();
      });
      
			});

			this.backgroundMode.setDefaults({ silent: false,
				title: "Você está ativo",
				text: "Será notificado quando houver solicitações de viagens novas",
				icon: 'icon4',
				color: '32db64',
				hidden: false});
      }
		
		if(this.ativo == false  ){
			
			this.status = "Ficar online";
			//console.log("ativo ",this.ativo);
			this.cor = "danger";
			this.authProvider.setstatus(false);
			
			if(this.authProvider.getUserp() != "vazio"){
				this.authProvider.rejeitarV();/// moddddd
			}
		
			if(this.authProvider.getstatus() == false){
		
			this.authProvider.driveroff(this.user).then(() =>{

			});}
			
				this.backgroundMode.disable();
		}
		//FIM DE back();
	}

	setBackground(title,text){//FAZER UM PROVIDER SO PRA BACKGROUND
		
		this.backgroundMode.configure({ silent: false,
			title: title,
			text: text,
			icon: 'icon4',
			color: '32db64',
			hidden: false});

		this.backgroundMode.setDefaults({ silent: false,
			title: title,
			text: text,
			icon: 'icon4',
			color: '32db64',
			hidden: false});
  }
  
	 Alert2() {
		    let alert1 = this.alertCtrl.create({
      			title: 'Deseja realmente fazer logout?',
      			subTitle: 'Você concelará a viagem atual se estiver em uma, e não recebera mais solicitações',
      			buttons: [
        			{
          				text: 'sim',
          				handler: () => {
                      if(this.ativo == true){
                        this.back();
                      }
            				  this.authProvider.logoutUser().then(() => {
							          this.nav.setRoot(LoginPage);
							        });
							        //console.log("sair");
          				}
        			},
        			{
          				text: 'não',
          				handler: () => {
            				
          				}
        			}
      					  ]
    			});
    			alert1.present();
	 }
	
	 Alert(option) {
		 if(this.authProvider.getNot() == false ){
		    if(option == false){
		    let alert1 = this.alertCtrl.create({
      			title: 'Deseja ficar online?',
      			subTitle: 'Você receberá um lugar na fila e notificações de viagens próximas',
      			buttons: [
        			{
          				text: 'sim',
          				handler: () => {
            				this.back();
          				}
        			},
        			{
          				text: 'não',
          				handler: () => {
            				//console.log('Agree clicked');
          				}
        			}
      					  ]
    			});
    			alert1.present();}
		 
		    if(option == true){
    		let alert2 = this.alertCtrl.create({
      			title: 'Deseja ficar offline?',
      			subTitle: 'Você não recebera mais notificações de corridas.',
      			buttons: [
        			{
          				text: 'sim',
          				handler: () => {
            				this.back();
          				}
        			},
        			{
          				text: 'não',
          				handler: () => {
            				//console.log('Agree clicked');
          				}
        			}
      					  ]
    			});
    		alert2.present();}
		 }else{
		
		let alert1 = this.alertCtrl.create({
      			title: 'Primeiro termine ou cancele a corrida!',
      			subTitle: 'Não pode mudar seu estatus com uma corrida em andamento.',
      			buttons: [
        			{
          				text: 'ok',
          				handler: () => {
							//console.log("ok");
          				}
        			}
				]
    			});
    			alert1.present();
		
	}
  }
//função que verifica a internet, envia requisições a todo momento para o servidor e observa o tempo de resposta
  timeout(){//MUDAR PARA SOCKET, FAZER A VERIFICAÇÃO DE INTERNET VIA SOCKET

	let that = this;

	let atu = new Date().getSeconds();

	let difsec = atu - this.net;

	////console.log("atu: ",atu);

	////console.log("net: ",this.net);

	////console.log("diferença: ",difsec);
   
	if((difsec >= 5 || (difsec > -54 && difsec < 0)) && this.off == false){
  
	  this.loading = this.loadingCtrl.create({
		content: "Restabelecendo conexão com a internet...",
	  });
	  this.loading.present();
	
	  this.off = true;
   }
	
	setTimeout(() => {
  
	 firebase.database().ref("net").set("true").then(()=>{
  
	  if(that.off == true){
  
	   that.loading.dismiss();
	   that.off = false;   
	  }
	  that.net = new Date().getSeconds();
	 }).catch(error => alert( " internet desconectada." + error));
  
	that.timeout();
	
	  },1000);
   
  }
	//função que atualiza os valores de hora e minuto no perfil do motorista, para verificar se ele esta com o app aberto ou nao
	private dataHoje() {//MUDAR PARA SOCKET, VERIFIAR SE O APP ESTA ABERTO OU NÃO VIA SOCKET
        
		    const that = this;
        
		    setTimeout (function () {
				
          
			if(that.authProvider.getstatus() == true){
        //console.log("dataHoje");
				if(that.authProvider.getUserp() == "vazio"){

					that.audio.stop('tabSwitch');
				}
                
    		  that.horas = new Date().getHours();
                
		      let hor = that.horas;
                
    		  if (hor < 10) {
        		  hor = "0" + hor;
    		  }
                
    		that.minutos = new Date().getMinutes();
                
		    let min = that.minutos;
                
    		if (min < 10) {
        		min = "0" + min;
			}
			
			that.ano = new Date().getFullYear();

			that.mes = new Date().getMonth() + 1;
			
			that.dia = new Date().getDate();
                
		    that.dataNow = hor + ":" + min;
        //console.log("Hora atualizada, ", that.dataNow);        
		    that.authProvider.setStatus(that.horas,that.minutos,that.ano,that.mes,that.dia,that.user).then(() =>{
				
			}).catch(error =>{
	      alert("app.component.ts/erro no datahoje()");
			});
			
			}
			that.dataHoje();	
			},5000);
	   	}
  //função que reconhece q o motorista ficou online 
	private desconect(){//MUDAR PARA ALGO MAIS COMPACTO
        
		const that = this;
        
		    setTimeout (function () {
                
				//console.log("desconect on ");
         
			if(that.ativo == false){
				
    		   if(that.authProvider.getstatus() == true){
				    
                    that.ativo = true;
                   
                    that.status = "Ficar offline";
                   
                    //console.log("ativo ",that.ativo);
                   
                    that.cor = "secondary";
                   
                    that.dataNow = that.authProvider.getPosition();
                   
                    //that.authProvider.driveron(that.dataNow,that.user,that.name,that.image).then(() =>{

                    that.authProvider.setstatus(true);
                    that.dataHoje();
                        
                    //});
                    //this.stopCont();
                    //this.para = 0;

					that.platform.ready().then( () => {


                    that.backgroundMode.enable();
                   
                    that.backgroundMode.on("activate").subscribe(()=>{
                        
                    that.backgroundMode.disableWebViewOptimizations();
                        
                    //alert("ligado");
					});
					
				});

				that.backgroundMode.setDefaults({ silent: false,
					title: "Você está ativo",
					text: "Será notificado quando houver solicitações de viagens novas",
					icon: 'icon4',
					color: '32db64',
					hidden: false});
			   }
				
			}
				
			that.desconect();	
			},3000);
		
	}
  //função que redireciona para as paginas estanciadas no menu
  	openPage(page) {
		
		if(page == 2){
			
			this.nav.push(ProfilePage,{image:this.image,imageuid:this.imageuid,user:this.user});
	  
		  }else{

    	if( page.component == 'sair'){
			
			this.Alert2();
    	}
      	else{
           if( page.component == 'perfil'){
			  this.nav.push(ProfilePage,{image:this.image,imageuid:this.imageuid,user:this.user,imageCar:this.imageCar});
		  }else{
			  this.nav.push(page.component);
		  }
        }
	 }
	}
}
