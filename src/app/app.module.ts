import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { Routes, RouterModule } from '@angular/router';
import { TabsComponent } from './tabs/tabs.component';
import { TabComponent } from './tabs/tab.component';
import { TableComponent } from './table/table.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { InfiniteScrollerDirective } from './_services/scroll.directive';
import { TestDirective } from './_services/test.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadModule } from 'ng2-file-upload';
import { ModalComponent } from './modal/modal.component';
import { FormsModule } from '@angular/forms';
import { MainComponent } from './main/main.component';
import { ConnectComponent } from './connect/connect.component';
import { ConnectionService, StageService } from './_services';
import { DateControlComponent } from './date-control/date-control.component';

@NgModule({
  declarations: [
    AppComponent,
    TabsComponent,
    TabComponent,
    TableComponent,
    ModalComponent,
    InfiniteScrollerDirective,
    TestDirective,
    ConnectComponent,
    MainComponent,
    DateControlComponent,
  ],
  entryComponents: [ModalComponent],
  imports: [
    FormsModule,
    NgbModule.forRoot(),
    HttpClientModule,
    BrowserModule,
    FileUploadModule,
    RouterModule.forRoot([])
  ],
  providers: [
    ConnectionService,
    StageService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
