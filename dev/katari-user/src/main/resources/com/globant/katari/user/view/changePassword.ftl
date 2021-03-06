<#import "spring.ftl" as spring />

<html>

  <head>
    <title>Change password</title>
  </head>

  <body>
    <h3>Change password</h3>
    <form id="changePassword" name="changePassword" method="POST" action="changePassword.do">

      <span class="error" id="message">
        <@spring.bind "command.*"/>
        <@spring.showErrors  "<br/>" />
      </span>
      
      <div class="clearfix column left">
      
        <div class="column left">  

          <@spring.formHiddenInput "command.userId" />

          <span class="formfield">
            <label for="oldPassword">Old Password</label>
            <@spring.formPasswordInput "command.password.oldPassword" />
          </span>

          <span class="formfield">
            <label for="password">New Password</label>
            <@spring.formPasswordInput "command.password.newPassword" />
          </span>

          <span class="formfield">
            <label for="passwordConfirm">Confirm New Password</label>
            <@spring.formPasswordInput "command.password.confirmedPassword" />
          </span>       

          <input class="btn rightMargin" type="submit" value="Save"/>
          <input class="btn" type="submit" value="Cancel" onclick="window.location=
              '${request.contextPath}/users.do';return false;"/>
              
        </div>
          
      </div>
    </form>
  </body>
</html>

<!-- vim: set ts=2 et sw=2 ai ft=xml: -->

