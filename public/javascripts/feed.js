var flag = true;

function like(postId, postLikes) {
    if (flag) {
        const likeHeart = document.getElementById(`like-heart-${postId}`);
        likeHeart.classList.remove('ri-heart-line');
        likeHeart.classList.add('ri-heart-fill');
        document.querySelector(`#post-${postId}`).textContent = Number(postLikes) + 1
        flag = false;
    } else {
        const likeHeart = document.getElementById(`like-heart-${postId}`);
        likeHeart.classList.remove('ri-heart-fill');
        likeHeart.classList.add('ri-heart-line');
        document.querySelector(`#post-${postId}`).textContent = postLikes
        flag = true;
    }
    axios.get(`/like/${postId}`)
}

function unlike(postId, postLikes) {
    if (flag) {
        const unlikeHeart = document.getElementById(`unlike-heart-${postId}`);
        unlikeHeart.classList.remove('ri-heart-fill');
        unlikeHeart.classList.add('ri-heart-line');
        document.querySelector(`#post-${postId}`).textContent = postLikes - 1
        flag = false;

    } else {
        const unlikeHeart = document.getElementById(`unlike-heart-${postId}`);
        unlikeHeart.classList.remove('ri-heart-line');
        unlikeHeart.classList.add('ri-heart-fill');
        document.querySelector(`#post-${postId}`).textContent = postLikes
        flag = true;
    }
    axios.get(`/like/${postId}`)
}

document.querySelector("#comments-overlay>svg").addEventListener("click", function () {
    document.querySelector("#comments-overlay").style.display = "none"
    document.querySelector("#comments-left").innerHTML = ``
    document.querySelector("#comments-nav-left").innerHTML = ``
    document.querySelector("#comments-section").innerHTML = ``
})

function viewComments(postId) {
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
        } else {
            document.querySelector("#comments-left").innerHTML = `<video src="../images/postuploads/${res.data.image}" autoplay muted></video>`
        }
        document.querySelector("#comments-nav-left").innerHTML = `<div id="user-dp">
                            <img src="../../images/profilepicuploads/${res.data.user.profile}" alt="">
                        </div>
                        <a href="">${res.data.user.username}</a>
                        <a href="">Follow</a>`

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

function addComment(postId, commentsCount) {
    var commentForm = document.querySelector(`#comment-form-${postId}`);
    var newcomment = document.querySelector(`#comment-area-${postId}`).value
    commentForm.addEventListener("submit", function (e) {
        e.preventDefault()
        axios.post(`/addcomment/${postId}`, { newcomment: newcomment })
        document.querySelector(`#comment-area-${postId}`).value = ""
        document.querySelector(`#comments-count-${postId}`).textContent = Number(commentsCount) + 1
    })
}

document.querySelector("#rnr-left #user-dp").addEventListener("click", function () {
    document.querySelector("#storyinp").click()
})

document.querySelector("#story-form").addEventListener("change", function () {
    document.querySelector("#story-submit").click()
    document.querySelector("#storyinp").value = ""
})

var storyForm = document.querySelector("#story-form")
storyForm.addEventListener("submit", (e) => {
    e.preventDefault()

    document.querySelector("#story-overlay").style.display = "flex"
    document.querySelector("#story-overlay").innerHTML = `<div id="story-center">
            <img src="https://i.gifer.com/ZKZg.gif" id="loading-gif" alt="">
        </div>`
    var formdata = new FormData(storyForm)
    axios.post('/newStory', formdata)
        .then((res) => {

            document.querySelector("#story-center").innerHTML = `
                <img id="story-preview" src="../images/storyuploads/${res.data}" alt="">
            <div id="story-nav">
                <svg id="discard-story-btn" aria-label="Close" class="x1lliihq x1n2onr6 x9bdzbf" fill="currentColor" height="18" role="img"
                    viewBox="0 0 24 24" width="18">
                    <title>Close</title>
                    <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor"
                        stroke-linecap="round" stroke-linejoin="round" stroke-width="3"></polyline>
                    <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
                        x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
                </svg>
                <div id="story-options"></div>
            </div>
            <div id="story-footer">
                <div id="addstory">
                    <a href="/addstory/${res.data}">
                        <div id="addtostory-icon">
                            <span>+</span>
                        </div>
                        Add to your story
                    </a>
                </div>
            </div>
            <div id="discard-story-overlay">
            <div id="discard-story-center">
                <h2>Discard story?</h2>
                <p>If you leave, your edits won't be saved.</p>
                <a href="/feed">Discard</a>
                <h3 id="ds-cancel-btn">Cancel</h3>
            </div>
        </div>
                `
            document.querySelector("#discard-story-btn").addEventListener("click", () => {
                document.querySelector("#discard-story-overlay").style.display = "flex"
            })
            document.querySelector("#ds-cancel-btn").addEventListener("click", () => {
                document.querySelector("#discard-story-overlay").style.display = "none"
            })
        })
})
