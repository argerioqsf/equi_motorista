import { Component } from "@angular/core";
import {
Alert,
AlertController,
IonicPage,
NavController,
NavParams,
ActionSheetController,
LoadingController
} from "ionic-angular";
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ProfileProvider } from "../../providers/profile/profile";
import { AuthProvider } from "../../providers/auth/auth";
import { LoginPage } from '../login/login';
import firebase from 'firebase';
import { BackgroundMode } from '@ionic-native/background-mode';
import { Platform, ViewController } from 'ionic-angular';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {
    image:any = "assets/images/newUser-b.png";
    imageCar:any = "assets/images/carro.jpg";
    public userProfile: any;
    public birthDate: string;
    public imageuid;	
    public myPhotosRef: any;
    public myPhoto: any = null;
    public myPhotoURL: any;
 loading2;
 imageDate = {};
 user;
 optionsTake: CameraOptions = {
  	quality: 50,
  	destinationType: this.camera.DestinationType.DATA_URL,
  	encodingType: this.camera.EncodingType.JPEG,
  	mediaType: this.camera.MediaType.PICTURE
 };
 
 optionsGet: CameraOptions = {
  	quality: 50,
	sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
  	destinationType: this.camera.DestinationType.DATA_URL,
  	encodingType: this.camera.EncodingType.JPEG,
  	mediaType: this.camera.MediaType.PICTURE
 };
  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public authProvider: AuthProvider,
              public profileProvider: ProfileProvider,
              public navParams: NavParams,
			  public actionSheetCtrl: ActionSheetController,
			  private camera: Camera,
              public loadingCtrl: LoadingController,
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

      this.image = navParams.get('image');
      this.imageCar = navParams.get('imageCar');
      this.imageuid = navParams.get('imageuid');
      this.user = navParams.get('user');
      this.myPhotosRef = firebase.storage().ref('imagens/');
  }

  ionViewDidLoad() {
this.profileProvider.getUserProfile().on("value", userProfileSnapshot => {
this.userProfile = userProfileSnapshot.val();
this.birthDate = userProfileSnapshot.val().birthDate;
});
}
  logOut(): void {
this.authProvider.logoutUser().then(() => {
this.navCtrl.setRoot(LoginPage);
});
}
  updateName(): void {

      const alert: Alert = this.alertCtrl.create({

          message: "Seu primeiro nome e seu segundo nome",
          inputs: [
              {
                  name: "firstName",
                  placeholder: "Seu primeiro nome",
                  value: this.userProfile.firstName
              },
              {
                  name: "lastName",
                  placeholder: "Seu segundo nome",
                  value: this.userProfile.lastName
              }
          ],
          buttons: [
              { text: "Cancelar" },
              {
                  text: "Salvar",
                  handler: data => {
                      this.profileProvider.updateName(data.firstName, data.lastName);
                  }
              }
          ]
      });
      alert.present();
  }

  updateTel(): void {

    const alert: Alert = this.alertCtrl.create({

        message: "Seu numero de telefone.",
        inputs: [
            {
                name: "telefone",
                placeholder: "Seu telefone",
                value: this.userProfile.telefone
            }
        ],
        buttons: [
            { text: "Cancelar" },
            {
                text: "Salvar",
                handler: data => {
                    this.profileProvider.updateTel(data.telefone);
                }
            }
        ]
    });
    alert.present();
}

updatecod(): void {

    const alert: Alert = this.alertCtrl.create({

        message: "Seu código de identificação.",
        inputs: [
            {
                name: "codigo",
                placeholder: "Seu código",
                value: this.userProfile.codigo
            }
        ],
        buttons: [
            { text: "Cancelar" },
            {
                text: "Salvar",
                handler: data => {
                    this.profileProvider.updatecod(data.codigo);
                }
            }
        ]
    });
    alert.present();
}

    updateDOB(birthDate:string):void {
        this.profileProvider.updateDOB(birthDate);
    }
    updateEmail(): void {
        let alert: Alert = this.alertCtrl.create({
            inputs: [{ name: 'newEmail', placeholder: 'Seu novo email' },
                     { name: 'password', placeholder: 'Sua senha', type: 'password' }],
            buttons: [
                { text: 'Cancelar' },
                { text: 'Salvar',
                 handler: data => {
                     let newEmail = data.newEmail;
                     this.profileProvider
                         .updateEmail(data.newEmail, data.password)
                         .then(() => { console.log('Email modificado com sucesso!'); })
                         .catch(error => { console.log('ERROR: ' + error.message); });
                 }}]
        });
        alert.present();
    }
    updatePassword(): void {
        let alert: Alert = this.alertCtrl.create({
            inputs: [
                { name: 'newPassword', placeholder: 'Nova senha', type: 'password' },
                { name: 'oldPassword', placeholder: 'Senha antiga', type: 'password' }],
            buttons: [
                { text: 'Cancelar' },
                { text: 'Salvar',
                 handler: data => {
                     this.profileProvider.updatePassword(
                         data.newPassword,
                         data.oldPassword
                     );
                 }
                }
            ]
        });
        alert.present();
    }
	
	updateImage(tipo) {

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Adicionar foto',
      buttons: [
        { icon: 'md-image',
          text: 'Galeria',
          role: 'destructive',
          handler: () => {
           this.selectPhoto(tipo);
          }
        },{ icon:'md-camera',
            text: 'Camera',
            handler: () => {
              this.takePhoto(tipo);
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
	
	takePhoto(tipo): void {

    this.camera.getPicture(this.optionsTake).then(imageData => {
      this.myPhoto = imageData;
      this.loading2 = this.loadingCtrl.create();
      this.loading2.present();
      if(tipo == 1){this.uploadPhoto();};
      if(tipo == 2){this.uploadPhoto2();};
    }, error => {
      let laert = this.alertCtrl.create({
        title:"Erro no carregamento da imagem",
        subTitle:"Tente novamente, erro: " + JSON.stringify(error)
      });
    });

  }
	
	selectPhoto(tipo): void {

    this.camera.getPicture(this.optionsGet).then(imageData => {
      this.myPhoto = imageData;
      //alert("indo 1 ");
	  this.loading2 = this.loadingCtrl.create();
	  this.loading2.present();
	  if(tipo == 1){this.uploadPhoto();};
	  if(tipo == 2){this.uploadPhoto2();};
    }, error => {
        if(JSON.stringify(error) != "Selection cancelled."){
           // alert("ERROR -> " + JSON.stringify(error));
        }
        let laert = this.alertCtrl.create({
          title:"Erro no carregamento da imagem",
          subTitle:"Tente novamente, erro: " + JSON.stringify(error)
        });
    
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
          this.image = downloadURL;
		  this.imageUp(this.image);
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
          this.imageCar = downloadURL;
		      this.imageUp2(this.imageCar);
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
	
	public imageUp(image){
		//alert("indo 3 ");
		this.imageDate = {
				image:image,
				imageuid:this.imageuid,
			    user:this.user
			};
		
		this.authProvider.imageUp(this.imageDate).then( user => {
          this.loading2.dismiss();
				},error => {
              this.loading2.dismiss();
						  const alert: Alert = this.alertCtrl.create({
                message: "Erro no upload da imagen, Erro: " + error.message,
                buttons: [{ text: "Ok", role: "Cancelar" }]
						});
						alert.present();
					
				}
			);
		
		
    }
    
    public imageUp2(image){
		//alert("indo 3 ");
		this.imageDate = {
				image:image,
				imageuid:this.imageuid,
			    user:this.user
			};
		
		this.authProvider.imageUpCar(this.imageDate).then( user => {
            
                    //alert("foto enviada");
					this.loading2.dismiss();
				},
				error => {
          this.loading2.dismiss();
          const alert: Alert = this.alertCtrl.create({
            message: "Erro no upload da imagen, Erro: " + error.message,
            buttons: [{ text: "Ok", role: "Cancelar" }]
          });
          alert.present();
					
				}
			);
		
		
    }
    
    updatePlaca(): void {

        const alert: Alert = this.alertCtrl.create({
  
            message: "A placa do seu carro.",
            inputs: [
                {
                    name: "placa",
                    placeholder: "Placa",
                    value: this.userProfile.carro.placa
                }
            ],
            buttons: [
                { text: "Cancelar" },
                { text: "Salvar",
                    handler: data => {
                        this.profileProvider.updatePlaca(data.placa);
                    }
                }
            ]
        });
        alert.present();
    }

    updateModelo(): void {

        const alert: Alert = this.alertCtrl.create({
  
            message: "O modelo do seu carro.",
            inputs: [
                {
                    name: "modelo",
                    placeholder: "Modelo",
                    value: this.userProfile.carro.modelo
                }
            ],
            buttons: [
                { text: "Cancelar" },
                { text: "Salvar",
                    handler: data => {
                        this.profileProvider.updateModelo(data.modelo);
                    }
                }
            ]
        });
        alert.present();
    }
	
  

}
