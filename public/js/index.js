// firebase
const db = firebase.firestore();

async function login() {
    let password = document.getElementById("passwordField").value
    let username = document.getElementById("usernameField").value
    let errorText = document.getElementById("errorText")

    const res = await fetch("http://localhost/login",
    {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            parcel: {
            password, username
            }
        })
    })
    const data = await res.json();

    if (data.userLoggedIn) {
        console.log("Logging in!");
    }

    if (data.message) {
        message = data.message
        console.log(message + "haha");
        errorText.innerText = message
    }

    if (data.userLoggedIn == true) {
        window.location.replace("logged")
    }

}

async function register() {
    let email = document.getElementById("emailField").value
    let username = document.getElementById("usernameField").value
    let password = document.getElementById("passwordField").value
    let confirm = document.getElementById("confirmField").value
    let confirmWarning = document.getElementById("confirmWarning")

    confirmWarning.innerText = (password != confirm) ? "Your confirmation does not match!" : "";

    if ((password == confirm)){

        const now = new Date();

        // console.log(encryptPassword(password));

        const res = await fetch("http://localhost/hashing",
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                parcel: {
                password, email
                }
            })
        })
        const data = await res.json()

        const details = {
            email: email,
            username: username,
            created_at: firebase.firestore.Timestamp.fromDate(now),
            password: data.pass
        };

        console.log(details);
        
        
            db.collection("users").add(details).then(() => {
              console.log("User Added!");
            }).catch(err => {
              console.log(err)
            });

      }
}

async function sendResetPass() {
    let email = document.getElementById("emailField").value
    let status = document.getElementById("statusMessage")


        const now = new Date();

        const res = await fetch("http://localhost/sendResetPass",
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                parcel: {
                email
                }
            })
        })
        const data = await res.json()

        console.log(data);

        if (data.error) {
        status.innerText = data.error
        }
        else if (data.message) {
        status.innerText = data.message
        }

}

async function resetPass() {
    let password = document.getElementById("newPassField").value
    let confirm = document.getElementById("newConfirmPassField").value
    let status = document.getElementById("statusMessage")
    let url = window.location.search;
    let args = url.slice(1).split("&");
    let email = args[0].slice(6);
    let token = args[1].slice(6);

    console.log(args);
    console.log(email);
    console.log(token);

    if (password == confirm) {

    const res = await fetch("http://localhost/resetPass",
    {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            parcel: {
            email, token, password
            }
        })
    })
    const data = await res.json()

    console.log(data);        

    if (data.error) {
        status.innerText = data.error
    }
    else if (data.message) {
        status.innerText = data.message
        setTimeout(() => {
            window.location = "http://localhost/";
        }, "3000")
    }

    }

}


// async function encryptPassword(pass) {
//     const res = await fetch("http://localhost/info",
//         {
//             method: 'POST',
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//                 parcel: pass
//             })
//         })
//     const data = await res.json()
//     console.log(data.pass);
// }