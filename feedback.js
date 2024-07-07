document.querySelector("#sub").addEventListener("click", () => {
    const email = document.querySelector("#email").value.trim();
    const feedback = document.querySelector("#feedback").value.trim();

    if (!email || !feedback) {
        alert("Please fill out both the email and feedback fields.");
    } else {
        alert("Thanks for filling the feedback");
        window.location.href = "feedback.html";
    }
});