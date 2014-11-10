$(function() {
  // Prompt the user for a name to use.
  var name = prompt("Your name?", "Guest"),
      currentStatus = "\u2605 online";

  var firebaseRef = new Firebase("https://INSTANCE.firebaseio.com");

  // Get a reference to the presence data in Firebase.
  var userListRef = firebaseRef.child("presence");

  // Generate a reference to a new location for my user with push.
  var myUserRef = userListRef.push();

  // Get a reference to my own presence status.
  var connectedRef = firebaseRef.child(".info/connected");
  connectedRef.on("value", function(isOnline) {
    if (isOnline.val()) {
      // If we lose our internet connection, we want ourselves removed from the list.
      myUserRef.onDisconnect().remove();

      // Set our initial online status.
      setUserStatus("\u2605 online");
    } else {

      // We need to catch anytime we are marked as offline and then set the correct status. We
      // could be marked as offline 1) on page load or 2) when we lose our internet connection
      // temporarily.
      setUserStatus(currentStatus);
    }
  });

  // A helper function to let us set our own state.
  function setUserStatus(status) {
    console.log(status);
    // Set our status in the list of online users.
    currentStatus = status;
    myUserRef.set({ name: name, status: status });
  }

  // Update our GUI to show someone"s online status.
  userListRef.on("child_added", function(snapshot) {
    var user = snapshot.val();
    console.log("user1:", user);
    $("#presenceDiv").append($("<div/>").attr("id", snapshot.key()));
    $("#" + snapshot.key()).text(user.name + " is currently " + user.status);
  });

  // Update our GUI to remove the status of a user who has left.
  userListRef.on("child_removed", function(snapshot) {
    $("#" + snapshot.key()).remove();
  });

  // Update our GUI to change a user"s status.
  userListRef.on("child_changed", function(snapshot) {
    var user = snapshot.val();
    console.log("user2:", user);
    $("#" + snapshot.key()).text(user.name + " is currently " + user.status);
  });

  // Use idle/away/back events created by idle.js to update our status information.
  document.onIdle = function () {
    setUserStatus("\u2606 idle");
  }
  document.onAway = function () {
    setUserStatus("\u2604 away");
  }
  document.onBack = function (isIdle, isAway) {
    setUserStatus("\u2605 online");
  }

  setIdleTimeout(5000);
  setAwayTimeout(10000);
});
