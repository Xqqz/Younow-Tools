if (tag) {
    true;
}
else if (user) {
    if (user.viewers > 100) {
        "follow";
    }
    else {
        "waiting";
    }
}
