import { Component, OnInit, ChangeDetectionStrategy, Input, OnDestroy } from '@angular/core';
import { environment } from '../../../environments/environment';
import { FeedItem } from '../models/feed-item.model';
import { FeedProviderService } from '../services/feed.provider.service';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-feed-list',
  templateUrl: './feed-list.component.html',
  styleUrls: ['./feed-list.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedListComponent implements OnInit, OnDestroy {
  @Input() feedItems: FeedItem[];
  subscriptions: Subscription[] = [];

  processImageForm: FormGroup;
  captionProcessing = '';
  showThis: any;
  isImageLoading: Boolean = true;

  constructor(private formBuilder: FormBuilder, private feed: FeedProviderService, private sanitizer:DomSanitizer ) { }

  async ngOnInit() {
    this.processImageForm = this.formBuilder.group({
      imageUrlControl: new FormControl('', Validators.required)
    });

    this.subscriptions.push(
      this.feed.currentFeed$.subscribe((items) => {
      this.feedItems = items;
    }));

    await this.feed.getFeed();
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  createImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      this.isImageLoading = false;
      this.captionProcessing = '';
      this.showThis = this.sanitizer.bypassSecurityTrustResourceUrl(reader.result.toString());
    }, false);

    if (image) {
        reader.readAsDataURL(image);
    }
  }

  ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
  }

  getImageFromService() {

    if (!this.processImageForm.valid) { 
      this.captionProcessing = 'type image URL first.';
      return; 
    }

    this.isImageLoading = true;
    this.captionProcessing = '... wait processing image';
    const url = this.processImageForm.controls.imageUrlControl.value ;

    this.feed.proccessThisImage(url)
    .subscribe(data => {
      this.createImageFromBlob(data);
    }, error => {
      this.isImageLoading = false;
      console.log(error);
    }
    );
  }

}
