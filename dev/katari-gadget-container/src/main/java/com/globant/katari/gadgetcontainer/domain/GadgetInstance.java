/* vim: set ts=2 et sw=2 cindent fo=qroca: */

package com.globant.katari.gadgetcontainer.domain;

import org.apache.commons.lang.Validate;

import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Transient;
import javax.persistence.ManyToOne;
import javax.persistence.FetchType;

import com.globant.katari.shindig.domain.Application;

/** Represents an instance of a {@link Gadget}.
 *
 * This one contains the information that the xml-to-html shinding
 * implementations needs to perform the rendering, also gives the rpc support.
 *
 * @author waabox(emiliano[dot]arango[at]globant[dot]com)
 */
@Entity
@Table(name = "gadget_instances")
public class GadgetInstance {

  /** The id of the gadget instance, 0 for a newly created gadget instance.
   */
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private long id;

  /** The application corresponding to this gadget instance.
   *
   * It is never null.
   */
  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  private Application application;

  /** {@link String} that defines the position on the UI, eg: 1#1.
   *
   * It is never null.
   */
  @Column(name = "gadget_position", nullable = false)
  private String gadgetPosition;

  /** {@link String} that identifies the user and the application when the
   * gadget accesses the open social container.
   *
   * This token is passed to the GadgetInstance whenever the user requests a
   * new page generation. It is never null.
   *
   * Note: This is an implementation artifact to ease the generation of the
   * json/xml/whatever output.
   */
  @Transient
  private String securityToken;

  /** The user who is accessing to the application.
   *
   * See the note on securityToken.
   */
  @Transient
  private long viewer;

  /**
   * Hibernate constructor.
   */
  GadgetInstance() {
  }

  /** Creates a new Gadget instance.
   *
   * @param theApplication the application for this gadget instance. Cannot be
   * null.
   *
   * @param position {@link String} representation of the gadget position in
   * the page. The format is defined by the client side implementation (for
   * example, "3#2" for a column based layout. It cannot be empty.
   */
  public GadgetInstance(final Application theApplication,
      final String position) {
    Validate.notNull(theApplication, "the application can not be null");
    Validate.notEmpty(position, "position can not be null");
    application = theApplication;
    gadgetPosition = position;
  }

  /** Sets the security token for the current user and application, also
   * sets the person who is requesting access to the application.
   *
   * This operation is intended to be called only when the user requests the
   * page.
   *
   * @param theSecurityToken {@link String} the securityToken to set.
   * Cannot be empty.
   * @param gadgetViewer {@link String} the viewer to set. Can not be empty.
   */
  public void associateToViewer(final String theSecurityToken,
      final long theViewer) {
    Validate.notEmpty(theSecurityToken, "securityToken can not be null");
    Validate.isTrue(theViewer != 0, "viewer can not be 0");
    viewer = theViewer;
    securityToken = theSecurityToken;
  }

  /** @return long the id of the gadget instance.
   */
  public long getId() {
    return id;
  }

  /** @return {@link String} location of the gadget xml spec.
   */
  public Application getApplication() {
    return application;
  }

  /** Returns the url for the gadget xml.
   *
   * @return the url, never null.
   */
  public String getUrl() {
    return application.getUrl();
  }

  /** @return @link{String} the securityToken
   */
  public String getSecurityToken() {
    return securityToken;
  }

  /** @return @link{String} the current gadget viewer.
   */
  public long getViewer() {
    return viewer;
  }

  /** @return @link{String} the position inside the page of this gadget.
   */
  public String getGadgetPosition() {
    return gadgetPosition;
  }

  /** Change the actual position of the gadget.
   * @param newPosition {@link String} the new position. Can not be empty.
   */
  public void move(final String newPosition) {
    Validate.notEmpty(newPosition, "the gadget new position can not be empty");
    gadgetPosition = newPosition;
  }
}
