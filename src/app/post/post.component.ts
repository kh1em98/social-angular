import { Component, Input, OnInit } from '@angular/core';
import { Post } from './post.model';
import { AuthService } from '../core/auth.service';
import { take, tap } from 'rxjs/operators';
import { User } from '../shared/user.model';
import { PostService } from './post.service';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { noop } from 'rxjs';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
  animations: [
    trigger('fade', [
      state(
        'in',
        style({
          opacity: 1,
        })
      ),

      transition('void => *', [
        style({
          opacity: 0,
        }),
        animate(350),
      ]),

      transition('* => void', [
        animate(
          350,
          style({
            opacity: 0,
          })
        ),
      ]),
    ]),

    /* trigger('fade', [
      state(
        'in',
        style({
          opacity: 1,
        })
      ),
      // fade in when created. this could also be written as transition('void => *')
      transition(':enter', [style({ opacity: 0 }), animate(350)]),

      // fade out when destroyed. this could also be written as transition('void => *')
      transition(':leave', animate(350, style({ opacity: 0 }))),
    ]), */
  ],
})
export class PostComponent implements OnInit {
  box: {
    header: string;
    users: any;
  } = null;

  isLoading: boolean = false;
  notification: { message: string; typeNotification: string } = null;
  @Input() post: Post;
  isLiked: boolean = false;
  isRetweeted: boolean = false;
  user: User = null;
  constructor(
    private authService: AuthService,
    private postService: PostService
  ) {}

  ngOnInit(): void {
    this.authService.user.pipe(take(1)).subscribe((user) => {
      this.user = user;
    });

    this.isPostLiked();
    this.isPostRetweeted();
  }

  isPostLiked() {
    this.isLiked =
      this.post.likes.findIndex((user) => user === this.user._id) !== -1;
  }

  isPostRetweeted() {
    this.isRetweeted =
      this.post.retweets.findIndex((user) => user === this.user._id) !== -1;
  }

  onToggleLike() {
    if (this.isLiked) {
      this.isLiked = false;
      this.postService
        .unlikePost({ userId: this.user._id, postId: this.post._id })
        .subscribe();
    } else {
      this.isLiked = true;
      this.postService
        .likePost({ userId: this.user._id, postId: this.post._id })
        .subscribe();
    }
  }

  onRetweet() {
    if (this.isRetweeted) {
      this.notification = {
        message: 'Bạn đã chia sẻ bài viết rồi',
        typeNotification: 'alert-danger',
      };
    } else {
      this.isRetweeted = true;
      this.notification = {
        message: 'Chia sẻ bài viết thành công',
        typeNotification: 'alert-success',
      };
      this.postService
        .retweetPost({
          postId: this.post._id,
          userId: this.user._id,
        })
        .subscribe();
    }
    setTimeout(() => {
      this.notification = null;
    }, 1500);
  }

  onDeletePost() {
    this.isLoading = true;
    this.postService
      .deletePost({ postId: this.post._id })
      .pipe(
        tap(() => {
          this.isLoading = false;
        })
      )
      .subscribe(noop, (error) => {
        this.notification = {
          message: error,
          typeNotification: 'alert-danger',
        };
      });
  }

  showUserLike() {
    this.box = {
      header: 'Users Liked',
      users: this.post.likes,
    };
  }

  showUserRetweet() {
    this.box = {
      header: 'Users Retweeted',
      users: this.post.retweets,
    };
  }

  closeBox() {
    this.box = null;
  }
}
