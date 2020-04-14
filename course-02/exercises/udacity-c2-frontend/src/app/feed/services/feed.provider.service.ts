import { Injectable } from '@angular/core';
import { FeedItem, feedItemMocks } from '../models/feed-item.model';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiService } from '../../api/api.service';

@Injectable({
  providedIn: 'root'
})
export class FeedProviderService {
  currentFeed$: BehaviorSubject<FeedItem[]> = new BehaviorSubject<FeedItem[]>([]);

  constructor(private api: ApiService) { }

  async getFeed(): Promise<BehaviorSubject<FeedItem[]>> {
    const req = await this.api.get('/feed');
    const items = <FeedItem[]> req.rows;
    this.currentFeed$.next(items);
    return Promise.resolve(this.currentFeed$);
  }

  async uploadFeedItem(caption: string, file: File): Promise<any> {
    const res = await this.api.upload('/feed', file, {caption: caption, url: file.name});
    const feed = [res, ...this.currentFeed$.value];
    this.currentFeed$.next(feed);
    return res;
  }

  /**
   * This was originally created to process each of the S3 images.
   * However, since the signed URL didn't work I left the functionality here
   * to send and process any public accesable URL image  
   */
  public proccessThisImage(imageURL: string): Observable<Blob>{
    const url = '/feed/process-image/transform' ;
    return this.api.proccessThisImage(url, {"image_url": imageURL});
  }

}

// async getFeed() {
//   const url = `${API_HOST}/feed`;

//   const req = this.http.get(url, this.httpOptions).pipe(
//     map(this.extractData));
//     // catchError(this.handleError));
//   const resp = <any> (await req.toPromise());
//   return resp.rows;
// }
