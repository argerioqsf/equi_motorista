import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { LoginPage } from '../pages/login/login';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';
import { ProfilePage } from '../pages/profile/profile';
import { SviagensPage } from '../pages/sviagens/sviagens';
import { SignupPage } from '../pages/signup/signup';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { FIREBASE_CREDENTIALS } from './credentials';

import { BackgroundMode } from '@ionic-native/background-mode';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { NativeAudio } from '@ionic-native/native-audio';
import { Geolocation } from '@ionic-native/geolocation';
import { Insomnia } from '@ionic-native/insomnia';
import { Vibration } from '@ionic-native/vibration';
import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule, AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

import { AuthProvider } from '../providers/auth/auth';
import { AudioProvider } from '../providers/audio/audio';
import { ProfileProvider } from '../providers/profile/profile';
import { DadosProvider } from '../providers/dados/dados';
import { BeginProvider } from '../providers/begin/begin';
import { PagamentoProvider } from '../providers/pagamento/pagamento';


@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    ResetPasswordPage,
    SignupPage,
    SviagensPage,
    ProfilePage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(FIREBASE_CREDENTIALS),
    AngularFireDatabaseModule,
    AngularFireAuthModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    ResetPasswordPage,
    SignupPage,
    SviagensPage,
    ProfilePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AngularFireDatabase,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    BackgroundMode,
    AuthProvider,
    LocalNotifications,
    AndroidPermissions,
    NativeAudio,
    Geolocation,
    Insomnia,
    Vibration,
    AudioProvider,
    ProfileProvider,
    DadosProvider,
    BeginProvider,
    PagamentoProvider
  ]
})
export class AppModule {}
