/* vim: set ts=2 et sw=2 cindent fo=qroca: */

package com.globant.katari.gadgetcontainer.application;

import static org.apache.commons.lang.StringUtils.isBlank;

import org.apache.commons.lang.Validate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.json.JSONObject;
import org.json.JSONException;

import com.globant.katari.core.application.Command;
import com.globant.katari.gadgetcontainer.domain.ContextUserService;
import com.globant.katari.gadgetcontainer.domain.GadgetGroup;
import com.globant.katari.gadgetcontainer.domain.GadgetInstance;
import com.globant.katari.gadgetcontainer.domain.GadgetGroupRepository;

/** Looks for a gadget group by name, for the currently logged on user.
 *
 * It generates the json representation for the gadget group.
 */
public class GadgetGroupCommand implements Command<JSONObject> {

  /** The class logger.
   */
  private static Logger log = LoggerFactory.getLogger(GadgetGroupCommand.class);

  /** The repository for gadget groups.
   *
   * This is never null.
   */
  private final GadgetGroupRepository gadgetGroupRepository;

  /** Service used to obtain the currently logged on user.
   *
   * This is never null.
   */
  private final ContextUserService userService;

  /** The open social token service implementation.
   *
   * This is never null.
   */
  private final TokenService tokenService;

  /** The name of the gadget group to search, as provided by the user.
   */
  private String groupName;

  /** Constructor.
   *
   * @param theGroupRepository Cannot be null.
   *
   * @param theUserService Cannot be null.
   *
   * @param theTokenService Cannot be null.
   */
  public GadgetGroupCommand(final GadgetGroupRepository theGroupRepository,
      final ContextUserService theUserService,
      final TokenService theTokenService) {

    Validate.notNull(theGroupRepository, "gadget repository can not be null");
    Validate.notNull(theUserService, "user service can not be null");
    Validate.notNull(theTokenService, "token service can not be null");

    gadgetGroupRepository = theGroupRepository;
    userService = theUserService;
    tokenService = theTokenService;
  }

  /** Obtains the group name, as provided by the user.
   *
   * @return the groupName.
   */
  public String getGroupName() {
    return groupName;
  }

  /** The name of the group to search for, as provided by the user.
   *
   * @param name the groupName to set. It must be called with a non empty
   * string before calling execute.
   */
  public void setGroupName(final String name) {
    groupName = name;
  }

  /** Find the group with the given group name for the currently logged in
   * user.
   *
   * Call setGroupName with a non empty string before calling execute.
   *
   * The json structure is:
   *
   * <pre>
   * {
   *   "id":&lt;long&gt;,
   *   "name":"&lt;string&gt;"
   *   "ownerId":&lt;long&gt;,
   *   "viewerId":&lt;long&gt;,
   *   "numberOfColumns":&lt;int&gt;,
   *   "customizable":&lt;true|false&gt;,
   *   "gadgets":[
   *     {
   *       "id":&lt;long&gt;,
   *       "title":&lt;string&gt;,
   *       "appId":&lt;long&gt;,
   *       "column":&lt;int&gt;,
   *       "order":&lt;int&gt;,
   *       "securityToken":"token"
   *       "url":"url"
   *     }
   *   ],
   * }
   * </pre>
   *
   * If the gadget was not found, it returns an empty json object ({}).
   *
   * @return a json object, never returns null.
   */
  public JSONObject execute() {

    if(isBlank(groupName)) {
      throw new IllegalArgumentException("groupName can not be blank");
    }
    long uid = userService.getCurrentUserId();
    log.debug("searching group name = " + groupName + " for the user:" + uid);
    GadgetGroup group = gadgetGroupRepository.findGadgetGroup(uid, groupName);
    try {
      if (group != null) {
        return toJson(uid, group);
      } else {
        return new JSONObject();
      }
    } catch (JSONException e) {
      throw new RuntimeException("Error serializing to json", e);
    }
  }

  /** Generates the json representation of the provided gadget group.
   *
   * @param uid The id of the user making the request.
   *
   * @param group The group to convert to json. It cannot be null.
   */
  private JSONObject toJson(final long uid, final GadgetGroup group)
    throws JSONException {
    Validate.notNull(group, "The gadget group cannot be null.");

    JSONObject groupJson = new JSONObject();
    if (group != null) {
      long owner = 0;
      if (group.getOwner() != null) {
        owner = group.getOwner().getId();
      }
      groupJson = new JSONObject();
      groupJson.put("id", group.getId());
      groupJson.put("name", group.getName());
      groupJson.put("ownerId", owner);
      groupJson.put("viewerId", uid);
      groupJson.put("numberOfColumns", group.getNumberOfColumns());
      groupJson.put("customizable", group.isCustomizable());

      for (GadgetInstance gadget : group.getGadgets()) {
        JSONObject gadgetJson = new JSONObject();
        gadgetJson.put("id", gadget.getId());
        gadgetJson.put("title", gadget.getTitle());
        gadgetJson.put("appId", gadget.getApplication().getId());
        gadgetJson.put("column", gadget.getColumn());
        gadgetJson.put("order", gadget.getOrder());
        gadgetJson.put("url", gadget.getApplication().getUrl());
        String token = tokenService.createSecurityToken(uid, owner, gadget);
        gadgetJson.put("securityToken", token);

        groupJson.append("gadgets", gadgetJson);
      }
    }
    return groupJson;
  }
}

