import { Component, ContentChildren, QueryList, AfterContentInit, Input, AfterViewInit } from '@angular/core';
import { TabComponent } from './tab.component';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'tabs',
  templateUrl: 'tabs.component.pug'
})
export class TabsComponent implements AfterContentInit, AfterViewInit {

  @ContentChildren(TabComponent) tabs: QueryList<TabComponent>;
  @Input() select$: Observable<number>;

  // contentChildren are set
  ngAfterContentInit() {
    // get all active tabs
    let activeTabs = this.tabs.filter((tab) => tab.active);

    // if there is no active tab set, activate the first
    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }

  ngAfterViewInit() {
    if (this.select$ && this.select$.subscribe) {
      this.select$.subscribe(tabNumber => {
        console.log('selecting tab #', tabNumber);
        const arr = this.tabs.toArray();
        arr.forEach(tab => tab.active = false);
        arr[tabNumber - 1].active = true;
      })
    }
  }

  selectTab(tab: TabComponent) {
    // deactivate all tabs
    this.tabs.toArray().forEach(tab => tab.active = false);

    // activate the tab the user has clicked on.
    tab.active = true;
  }
}
