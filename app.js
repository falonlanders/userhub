const BASE_URL = "https://jsonplace-univclone.herokuapp.com"; //base URL for JSON

function fetchUsers() {
  //function to fetch users
  return fetch(`${BASE_URL}/users`)
    .then(function (response) {
      return response.json(); //calls json, returns result
    })
    .catch(function (error) {
      console.error(error); //logs out any errors
    });
}

function fetchData(url) {
  return fetch(url)
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      console.error(error);
    });
}

function fetchUserPosts(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/posts?_expand=user`);
}
function fetchPostComments(postId) {
  return fetchData(`${BASE_URL}/posts/${postId}/comments`);
}

function renderUser(user) {
  //builds user cards
  return $(`<div class="user-card">
      <header>
        <h2>${user.name}</h2>
      </header>
      <section class="company-info">
        <p><b>Contact:</b> ${user.email}</p>
        <p><b>Works for:</b> ${user.company.name}</b></p>
        <p><b>Company creed:</b> "${user.company.catchPhrase}"</p>
      </section>
      <footer>
        <button class="load-posts">POSTS BY ${user.username}</button>
        <button class="load-albums">ALBUMS BY ${user.username}</button>
      </footer>
    </div>`).data("user", user);
}

//grabs element with id user-list empties it and appends the result
//of renderUser to each user in the user list
function renderUserList(list) {
  const userList = $("#user-list");
  userList.empty();

  list.forEach(function (user) {
    userList.append(renderUser(user));
  });
}

function fetchUserAlbumList(userId) {
  return fetchData(`${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`);
}

function setCommentsOnPost(post) {
  if (post.comments === undefined) {
    return fetchPostComments(post.id).then(function (comment) {
      post.comments = comment;
      return post;
    });
  } else {
    return Promise.reject();
  }
}

/* render a single album */
function renderAlbum(album) {
  let card = $(`<div class="album-card">
  <header>
    <h3>${album.title}</h3>
  </header>
  <section class="photo-list">
  </section>
</div>`);
  album.photos.forEach(function (photo) {
    $(".photo-list").append(renderPhoto(photo));
  });
  return card;
}

/* render a single photo */
function renderPhoto(photo) {
  return $(`<div class="photo-card">
    <a href="${photo.url}" target="_blank">
      <img src="${photo.thumbnailUrl}" />
      <figure>${photo.title}</figure>
    </a>
  </div>`);
}

function renderPostList(postList) {
  $("#app section.active").removeClass("active");
  $("#post-list").addClass("active").empty();
  postList.forEach(function (post) {
    $("#post-list").append(renderPost(post));
  });
}

function renderPost(post) {
  let posty = $(`<div class="post-card">
  <header>
    <h3>${post.title}</h3>
    <h3>${post.username}</h3>
  </header>
  <p>${post.body}</p>
  <footer>
    <div class="comments"></div>
    <a href="#" class="toggle">(<span class="verb">show</span> comments)</a>
  </footer>
</div>`).data("post", post);
  return posty;
}

/* render an array of albums */
function renderAlbumList(albumList) {
  $("#app section.active").removeClass("active");

  const albumListElement = $("#album-list");
  albumListElement.empty().addClass("active");

  albumList.forEach(function (album) {
    albumListElement.append(renderAlbum(album));
  });
}

function toggleComments(postCardElement) {
  const footerElement = postCardElement.find("footer");

  if (footerElement.hasClass("comments-open")) {
    footerElement.removeClass("comments-open");
    footerElement.find(".verb").text("show");
  } else {
    footerElement.addClass("comments-open");
    footerElement.find(".verb").text("hide");
  }
}

$("#post-list").on("click", ".post-card .toggle", function () {
  const card = $(this).closest(".post-card").find(".comments");
  const post = $(this).closest(".post-card").data("post");
  setCommentsOnPost(post)
    .then(function (post) {
      card.empty();
      post.comments.forEach(function (comment) {
        card.append(
          `<h3>${comment.body}</br>-${comment.email}</h3>`
        );
      });
      toggleComments(card);
    })
    .catch(function () {
      toggleComments(card);
    });
});

$("#user-list").on("click", ".user-card .load-posts", function () {
  const user = $(this).closest(".user-card").data("user"); //loads posts
  fetchUserPosts(user.id).then(renderPostList); //renders posts
});

$("#user-list").on("click", ".user-card .load-albums", function () {
  const user = $(this).closest(".user-card").data("user"); //loads posts
  fetchUserAlbumList(user.id).then(renderAlbumList); //renders list
});

function bootstrap() {
  fetchUsers().then(renderUserList);
}

bootstrap();
