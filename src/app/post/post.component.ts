import { Component, Input, OnInit } from '@angular/core';
import { Post } from './post.model';
import { AuthService } from '../core/auth.service';
import { take, tap } from 'rxjs/operators';
import { User } from '../shared/user.model';
import { PostService } from './post.service';
import { noop } from 'rxjs';
import { UserProfile } from '../user/wall.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
  isLoading: boolean = false;
  notification: { message: string; typeNotification: string } = null;
  @Input() post: Post;
  @Input() isPostRetweeted = false;
  @Input() userRetweeted: UserProfile = null;
  isLiked: boolean = false;
  isRetweeted: boolean = false;
  isMyPost: boolean = false;
  user: User = null;
  constructor(
    private authService: AuthService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.authService.user.pipe(take(1)).subscribe((user) => {
      this.user = user;
    });

    this.checkIsMyPost();
    this.checkIsPostLiked();
    this.checkIsPostRetweeted();
  }

  onToggleLike() {
    this.isLoading = true;
    if (this.isLiked) {
      this.isLiked = false;

      this.postService
        .unlikePost(this.post._id, this.user)
        .pipe(tap(() => (this.isLoading = false)))
        .subscribe(noop, (error) => this.showNotificationError(error));
    } else {
      this.isLiked = true;
      this.postService
        .likePost(this.post._id, this.user)
        .pipe(tap(() => (this.isLoading = false)))
        .subscribe(noop, (error) => this.showNotificationError(error));
    }
  }

  onRetweet() {
    if (this.isRetweeted) {
      this.showNotificationError('Bạn đã chia sẻ bài viết rồi');
    } else {
      this.isLoading = true;
      this.isRetweeted = true;
      this.notification = {
        message: 'Chia sẻ bài viết thành công',
        typeNotification: 'alert-success',
      };
      this.postService
        .retweetPost(this.post._id, this.user)
        .pipe(tap(() => (this.isLoading = false)))
        .subscribe();
    }
    setTimeout(() => {
      this.notification = null;
    }, 1500);
  }

  onDeletePost() {
    this.isLoading = true;
    this.postService
      .deletePost(this.post._id)
      .pipe(
        tap(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        () => {
          this.post = null;
        },
        (error) => this.showNotificationError(error)
      );
  }

  checkIsMyPost() {
    this.isMyPost = this.post.userPost._id === this.user._id;
  }

  checkIsPostLiked() {
    this.isLiked =
      this.post.likes.findIndex((user) => user === this.user._id) !== -1;
  }

  checkIsPostRetweeted() {
    this.isRetweeted =
      this.post.retweets.findIndex((user) => user === this.user._id) !== -1;
  }

  showNotificationError(error) {
    this.notification = {
      message: error,
      typeNotification: 'alert-danger',
    };

    setTimeout(() => {
      this.notification = null;
    }, 1500);
  }
}
