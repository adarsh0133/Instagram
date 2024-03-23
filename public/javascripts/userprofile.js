function showPost(postId) {
    document.querySelector("#comments-overlay").style.display = "flex"
    axios.get(`/getcomments/${postId}`).then((res) => {
        var clutter = `<div class="comment">
<div class="comment-user-dp">
<img src="../images/profilepicuploads/${res.data.user.profile}" alt="">
</div>
<div class="comment-right">
<p><a href="">${res.data.user.username}</a> ${res.data.caption}</p>
</div>
</div>`;
        if (res.data.image.slice(res.data.image.lastIndexOf('.') + 1) === 'jpg' || res.data.image.slice(res.data.image.lastIndexOf('.') + 1) === 'jpeg' || res.data.image.slice(res.data.image.lastIndexOf('.') + 1) === 'png') {
            document.querySelector("#comments-left").innerHTML = `<img src="../../images/postuploads/${res.data.image}" alt="">`
        } else{
            document.querySelector("#comments-left").innerHTML = `<video src="../images/postuploads/${res.data.image}" autoplay loop></video>`
        }
        document.querySelector("#comment-form").innerHTML += `
                <input type="submit" value="Post" onclick="sendComment('${postId}')">`
        console.log(res.data)
        if (res.data.likes.length > 0) {
            if (res.data.likes.length === 1) {
                document.querySelector("#likes-dets").innerHTML = `<p>Liked by <span id="latest-like-username">${res.data.likes[res.data.likes.length - 1]}</span></p>`
            } else {
                document.querySelector("#likes-dets").innerHTML = `<p>Liked by <span id="latest-like-username">${res.data.likes[res.data.likes.length - 1]}</span> and <span id="post-likes-count">${res.data.likes.length - 1}</span> others</p>`
            }
        } else {
            document.querySelector("#likes-dets").innerHTML = ``
        }
        if (res.data.likes.indexOf('<%= loggedInUser.username %>') === -1) {
            document.querySelector("#like-btn").innerHTML = `<i class="ri-heart-line" id="like-heart" onclick="like('${res.data._id}')"></i>`
        } else {
            document.querySelector("#like-btn").innerHTML = `<i class="ri-heart-fill" id="unlike-heart" onclick="unlike('${res.data._id}')"></i>`
        }
        document.querySelector("#comments-nav-left").innerHTML = `<div id="user-dp">
                    <img src="../../images/profilepicuploads/${res.data.user.profile}" alt="">
                </div>
                <a href="">${res.data.user.username}</a>`

        if (res.data.comments.length >= 1) {
            res.data.comments.reverse().forEach((comment) => {
                clutter += `<div class="comment">
<div class="comment-user-dp">
<img src="../images/profilepicuploads/${comment.user.profile}" alt="">
</div>
<div class="comment-right">
<p><a href="">${comment.user.username}</a> ${comment.comment}</p>
</div>
<i class="ri-heart-line"></i>
</div>`
            })
        }
        document.querySelector("#comments-section").innerHTML = clutter
    })
}
document.querySelector(".close-post-btn").addEventListener("click", () => {
    document.querySelector("#comments-overlay").style.display = "none"
    document.querySelector("#comments-section").innerHTML = ``
    document.querySelector("#likes-dets").innerHTML = ``
    document.querySelector("#comment-form").innerHTML = `<textarea name="" placeholder="Add a comment..."></textarea>`
    document.querySelector(`#comment-form textarea`).value = ""
    document.querySelector("#comments-left").innerHTML = ""
    console.log("hey")
})

var flag = true

function like(postId, postLikes) {
    if (flag) {
        const likeHeart = document.getElementById(`like-heart`);
        likeHeart.classList.remove('ri-heart-line');
        likeHeart.classList.add('ri-heart-fill');
        flag = false;
    } else {
        const likeHeart = document.getElementById(`like-heart`);
        likeHeart.classList.remove('ri-heart-fill');
        likeHeart.classList.add('ri-heart-line');
        flag = true;
    }
    axios.get(`/like/${postId}`).then((res) => {
        console.log(res.data)
        if (res.data.likes.length > 0) {
            if (res.data.likes.length === 1) {
                document.querySelector("#likes-dets").innerHTML = `<p>Liked by <span id="latest-like-username">${res.data.likes[res.data.likes.length - 1]}</span></p>`
            } else {
                document.querySelector("#likes-dets").innerHTML = `<p>Liked by <span id="latest-like-username">${res.data.likes[res.data.likes.length - 1]}</span> and <span id="post-likes-count">${res.data.likes.length - 1}</span> others</p>`
            }
        } else {
            document.querySelector("#likes-dets").innerHTML = ``
        }
    })
}

function unlike(postId) {
    if (flag) {
        const unlikeHeart = document.getElementById(`unlike-heart`);
        unlikeHeart.classList.remove('ri-heart-fill');
        unlikeHeart.classList.add('ri-heart-line');
        flag = false;

    } else {
        const unlikeHeart = document.getElementById(`unlike-heart`);
        unlikeHeart.classList.remove('ri-heart-line');
        unlikeHeart.classList.add('ri-heart-fill');
        flag = true;
    }
    axios.get(`/like/${postId}`).then((res) => {
        console.log(res.data)
        if (res.data.likes.length > 0) {
            if (res.data.likes.length === 1) {
                document.querySelector("#likes-dets").innerHTML = `<p>Liked by <span id="latest-like-username">${res.data.likes[res.data.likes.length - 1]}</span></p>`
            } else {
                document.querySelector("#likes-dets").innerHTML = `<p>Liked by <span id="latest-like-username">${res.data.likes[res.data.likes.length - 1]}</span> and <span id="post-likes-count">${res.data.likes.length - 1}</span> others</p>`
            }
        } else {
            document.querySelector("#likes-dets").innerHTML = ``
        }
    })
}

function sendComment(postId) {
    var commentForm = document.querySelector(`#comment-form`);
    commentForm.addEventListener("submit", function (e) {
        e.preventDefault()
        var newcomment = document.querySelector(`#comment-form textarea`).value
        axios.post(`/addcomment/${postId}`, { newcomment: newcomment }).then((res) => {
            console.log(res.data)
            document.querySelector("#comments-section").innerHTML += `<div class="comment">
<div class="comment-user-dp">
<img src="../images/profilepicuploads/${res.data.user.profile}" alt="">
</div>
<div class="comment-right">
<p><a href="">${res.data.user.username}</a> ${res.data.comment}</p>
</div>
<i class="ri-heart-line"></i>
</div>`
        })
        document.querySelector(`#comment-form textarea`).value = ""
    })
}

