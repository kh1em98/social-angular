import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostService } from '../post/post.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostComponent implements OnInit {
  error: string = null;
  isLoading: boolean = false;
  createPostForm: FormGroup = null;
  @Input() user;
  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.createPostForm = new FormGroup({
      content: new FormControl('', Validators.required),
    });
  }

  onCreatePost() {
    if (this.createPostForm.valid) {
      this.isLoading = true;
      this.postService
        .createPost({
          ...this.createPostForm.value,
          name: this.user.name,
          avatar: this.user.avatar,
          username: this.user.username,
        })
        .subscribe(
          () => {
            this.createPostForm.reset();
            this.isLoading = false;
          },
          (errorMessage) => {
            this.createPostForm.reset();
            this.isLoading = false;
            this.error = errorMessage;
          }
        );
    }
  }

  closeAlertError() {
    this.error = '';
  }
}
