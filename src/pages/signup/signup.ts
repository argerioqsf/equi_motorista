import { Component } from "@angular/core";
import {
Alert,
AlertController,
IonicPage,
Loading,
LoadingController,
NavController,
NavParams,
ActionSheetController,
ToastController 
} from "ionic-angular";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthProvider } from "../../providers/auth/auth";
import { DadosProvider } from "../../providers/dados/dados";
import { EmailValidator } from "../../validators/email";
import { HomePage } from "../home/home";
import firebase from 'firebase';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Platform, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

cont = false;
public singup = {email:null,
				senha:null,
				image:null,
				imageCar:null,
				placa:null,
				telefone:null,
				codigo:null,
				modelo:null,
				imageuid:null,
				firstname:null,
				lastname:null};
 public imageuid;
 public imageURL:any = "assets/images/newUser-b.png";
 public imageURLCar:any = "assets/images/carro.jpg";
 public myPhotosRef: any;
 public fotooff: any ="";
 public myPhoto: any = null;
 public myPhotoURL: any;    
public signupForm: FormGroup;
public loading: Loading;
public loading2: Loading;

  constructor(public navCtrl: NavController,
			  public authProvider: AuthProvider,
			  public dadosProvider: DadosProvider,
			  public loadingCtrl: LoadingController,
			  public alertCtrl: AlertController,
			  formBuilder: FormBuilder, public navParams: NavParams,
			  public actionSheetCtrl: ActionSheetController,
				private camera: Camera,
				public toastCtrl: ToastController,
				public viewCtrl: ViewController,
				public platform: Platform,
				private backgroundMode: BackgroundMode) {

					this.platform.ready().then(() => {
						this.platform.registerBackButtonAction(() => {
				
							if(!this.viewCtrl.enableBack()) { 
								
								this.backgroundMode.moveToBackground();
				
							 }else{
				
								this.navCtrl.pop();
				
							 } 
							})});
	  
      
      this.signupForm = formBuilder.group({
		  email: ["",
				  Validators.compose([Validators.required, EmailValidator.isValid])
				 ],
		  password: ["",
					 Validators.compose([Validators.minLength(6), Validators.required])
					],
		  first: ["",
					 Validators.compose([Validators.minLength(1), Validators.required])
					],
		  last: ["",
					 Validators.compose([Validators.minLength(1), Validators.required])
					],
			placa: ["",
					 Validators.compose([Validators.minLength(1), Validators.required])
					],
		  modelo: ["",
					 Validators.compose([Validators.minLength(1), Validators.required])
					],
			ci: ["",
					Validators.compose([Validators.minLength(1), Validators.required])
				 ],
			tpc: ["",
				 Validators.compose([Validators.minLength(1), Validators.required])
				]	 
	  });
	  this.myPhotosRef = firebase.storage().ref('imagens/');
	  this.imageuid = this.generateUUID();
  }

 	signupUser(): void {
		 
		const re = /^([a-zA-Z0-9_\-\.]+)@equinociotaxi\.([a-zA-Z]{2,5})$/;

		if (!this.signupForm.valid ) {

		
			console.log(
				`Complete o formulário, valor atual: ${this.signupForm.value}`
			);
		} else {

			if (re.test(this.signupForm.value.email)) {
				if (this.imageURL != "assets/images/newUser-b.png" && this.imageURLCar != "assets/images/carro.jpg") {

      this.cont = true;
			let email: string = this.signupForm.value.email;
			let password: string = this.signupForm.value.password;
			let first: string = this.signupForm.value.first;
			let last: string = this.signupForm.value.last;
			let placa: string = this.signupForm.value.placa;
			let modelo: string = this.signupForm.value.modelo;
			let telefone: string = this.signupForm.value.tpc;
			let codigo: string = this.signupForm.value.ci;

			this.singup = {
				email:email,
				senha:password,
				placa:placa,
				modelo:modelo,
				imageCar: this.imageURLCar,
				telefone: telefone,
				codigo: codigo,
				image:this.imageURL,
				imageuid:this.imageuid,
				firstname:first,
				lastname:last
			}
			//this.uploadPhoto();
			this.authProvider.signupUser(this.singup).then( user => {
				
					this.loading.dismiss().then(() => {
						
						this.navCtrl.setRoot(HomePage);
					});
				},
				error => {

					this.cont = false;

					if(error == "Error: The email address is already in use by another account."){
						
						this.loading.dismiss().then(() => {
		
								const alert2: Alert = this.alertCtrl.create({
								title:'O endereço de e-mail já está sendo usado por outra conta.',
								buttons: ["Ok"]
							});
		
							alert2.present();
		
						});
					}else{
						
						this.loading.dismiss().then(() => {
		
							const alert2: Alert = this.alertCtrl.create({
							title:'Ocorreu algum probelma inesperado, Por favor, tente novamente',
							message: error,
							buttons: [{ text: "Ok", role: "cancel" }]
						});
	
						alert2.present();
	
					});
	
					}
				}).catch(error => {

					this.cont = false;
					this.loading.dismiss().then(() => {
	
						const alert2: Alert = this.alertCtrl.create({
						title:'Ocorreu algum probelma inesperado, Por favor, tente novamente',
						message: error,
						buttons: [{ text: "Ok", role: "cancel" }]
					});

					alert2.present();

				});
					
					console.error(error);
				
				});
				
			this.loading = this.loadingCtrl.create();
			this.loading.present();
		}else{

			if (this.imageURL == "assets/images/newUser-b.png" && this.imageURLCar == "assets/images/carro.jpg") {

				const alert: Alert = this.alertCtrl.create({
					message: "É obrigatório adicionar uma imagem de perfil e do carro para finalizar o cadastro.",
					buttons: ["Ok"]
				});
				alert.present();

			}else{

			if (this.imageURL == "assets/images/newUser-b.png") {
				const alert: Alert = this.alertCtrl.create({
					message: "É obrigatório adicionar uma imagem de perfil para finalizar o cadastro.",
					buttons: ["Ok"]
				});
				alert.present();
			}
			
			if (this.imageURLCar == "assets/images/carro.jpg") {

				const alert: Alert = this.alertCtrl.create({
					message: "É obrigatório adicionar uma imagem do carro para finalizar o cadastro.",
					buttons: ["Ok"]
				});
				alert.present();

			}
		}


		}
		}else{

			const alert: Alert = this.alertCtrl.create({
				title:"é somente permitido, emails filiados da cooperativa.",
				message: "ex: jose@equinociotaxi.com",
				buttons: ["Ok"]
			});
			alert.present();

		}
	}
	}
	
	presentActionSheet() {
		
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Adicionar foto',
      buttons: [
        { icon: 'md-image',
          text: 'Galeria',
          role: 'destructive',
          handler: () => {
           this.selectPhoto(1);
          }
        },{icon:'md-camera',
          text: 'Camera',
          handler: () => {
           this.takePhoto(1);
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
	}
	
	presentActionSheet2() {
		
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Adicionar foto',
      buttons: [
        { icon: 'md-image',
          text: 'Galeria',
          role: 'destructive',
          handler: () => {
           this.selectPhoto(2);
          }
        },{icon:'md-camera',
          text: 'Camera',
          handler: () => {
           this.takePhoto(2);
          }
        },{
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    actionSheet.present();
  }
	
	takePhoto(tipo) {
    this.camera.getPicture({
      quality: 50,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      encodingType: this.camera.EncodingType.JPEG,
      saveToPhotoAlbum: true,
      targetWidth: 300,
      targetHeight: 300
    }).then(imageData => {
      this.myPhoto = imageData;
      this.fotooff = imageData;
      this.loading2 = this.loadingCtrl.create();
      this.loading2.present();
      if(tipo == 1){this.uploadPhoto();};
			if(tipo == 2){this.uploadPhoto2();};
    }, error => {
      //alert("ERROR -> " + JSON.stringify(error));
    });
  }
	
	selectPhoto(tipo): void {

    this.camera.getPicture({

      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      destinationType: this.camera.DestinationType.DATA_URL,
      quality: 50,
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: 300,
			targetHeight: 300
			
    }).then(imageData => {

			this.myPhoto = imageData;
			this.fotooff = imageData;
      this.loading2 = this.loadingCtrl.create();
      this.loading2.present();
			if(tipo == 1){this.uploadPhoto();};
			if(tipo == 2){this.uploadPhoto2();};
			
    }, error => {

		 //alert("ERROR -> " + JSON.stringify(error));
		 
    });
  }
	
	 public uploadPhoto(): void { 
		let uploadTask =  this.myPhotosRef.child(this.imageuid).child('perfil.jpeg')
      .putString(this.myPhoto, 'base64', { contentType: 'image/jpeg' });
      uploadTask.on('state_changed',(savedPicture) => {
        let progress:any = (savedPicture.bytesTransferred / savedPicture.totalBytes) * 100;
        progress = parseInt(progress);
        console.log('Upload is ' + progress + '% done');
      }, error => {
        this.loading2.dismiss();
        let laert = this.alertCtrl.create({
          title:"Erro no carregamento da imagem",
          subTitle:"Tente novamente, erro: " + JSON.stringify(error)
        });
			},()=>{
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL)=>{
          console.log('File available at', downloadURL);
          this.imageURL = downloadURL;
          this.loading2.dismiss();
        });
      });
	}
	
	public uploadPhoto2(): void {
       let uploadTask =  this.myPhotosRef.child(this.imageuid).child('carro.jpeg')
       .putString(this.myPhoto, 'base64', { contentType: 'image/jpeg' });
       uploadTask.on('state_changed',(savedPicture) => {
         let progress:any = (savedPicture.bytesTransferred / savedPicture.totalBytes) * 100;
         progress = parseInt(progress);
         console.log('Upload is ' + progress + '% done');
       }, error => {
         this.loading2.dismiss();
         let laert = this.alertCtrl.create({
           title:"Erro no carregamento da imagem",
           subTitle:"Tente novamente, erro: " + JSON.stringify(error)
         });
       },()=>{
         uploadTask.snapshot.ref.getDownloadURL().then((downloadURL)=>{
           console.log('File available at', downloadURL);
           this.imageURLCar = downloadURL;
           this.loading2.dismiss();
         });
       });
  }
	
	private generateUUID(): any {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
	}

	toast(status) {

    let toast = this.toastCtrl.create({
      message:status,
      duration: 4000
    });
    toast.present();
  }
	
	ionViewDidLeave(){
		if( this.imageURL != "assets/images/newUser-b.png" && this.cont == false ){
			 console.log("deletar foto de perfil que não será usada");
			this.authProvider.delImage(this.imageURL).then(()=>{
        console.log("foto deletada");
      });

      }
      if( this.imageURLCar != "assets/images/carro.jpg" && this.cont == false ){
        console.log("deletar foto do carro que não será usasda");
          this.authProvider.delImage(this.imageURLCar).then(()=>{
            console.log("foto deletada");
          });
      }
      if(this.imageURLCar == "assets/images/carro.jpg" && this.cont == false ){
        console.log("Não foi preciso deletar imagens não utilizadas");
      }
		
	}

	}