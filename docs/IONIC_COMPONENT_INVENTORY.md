# Ionic-first Component Inventory

BlueLedger adopts the following policy: use a fitting Ionic component first, customize it through Ionic APIs and CSS, and use native elements only when Ionic has no semantic or rendering equivalent.

| Requirement          | Implementation                                                                    | Customization / rationale                                                                                                                             |
| -------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| App root and routing | `ion-app`, `ion-router-outlet`, `ion-tab-bar`, `ion-tab-button`                   | One persistent Ionic outlet owns transitions; Ionic tab primitives provide authenticated navigation without recreating it.                            |
| Page structure       | `ion-content`, `ion-header`, `ion-toolbar`, `ion-back-button`                     | CSS variables, slots, responsive wrappers, and toolbar color tokens establish the visual system.                                                      |
| Navigation           | `ion-tab-bar`, `ion-tab-button`, `ion-icon`                                       | The same Ionic items become a labelled desktop rail at 1024px.                                                                                        |
| User profile         | `ion-avatar`, Ionic action sheet and alert                                        | Avatar image failure falls back to initials; action sheet handles account actions and alert confirms sign-out.                                        |
| Authentication       | `ion-input`, `ion-input-password-toggle`, `ion-button`, `ion-spinner`, `ion-note` | Input fill, helper/error text, button states, and clear visible feedback remain Ionic-native.                                                         |
| Portfolio controls   | `ion-input`, `ion-range`, `ion-card`, `ion-button`                                | Ranges are visually vertical through wrappers and CSS; a narrow key adapter adds explicit Home/End and arrow semantics without replacing `ion-range`. |
| Currency selection   | `ion-segment`, `ion-segment-button`, `ion-list`, `ion-item`, `ion-chip`           | Segment and row selection share one signal.                                                                                                           |
| Analytics summaries  | `ion-card`, `ion-chip`, `ion-badge`, `ion-skeleton-text`                          | Cards and status surfaces use Ionic shadows/variables and accessible labels.                                                                          |
| Charts               | Chart.js `<canvas>`                                                               | Ionic does not provide a chart component. Canvas is visual-only, with native textual chart summaries alongside it.                                    |
| Document semantics   | Native headings, paragraphs, lists, and chart descriptions                        | These are document content rather than application controls.                                                                                          |

## Native interactive fallback log

None. Every application interaction currently uses Ionic or Angular router primitives. Native semantic content and the Chart.js canvas are not interactive controls.

If a future native control is proposed, its implementation-log entry must identify the Ionic component evaluated, customization attempted, unmet accessibility/behavior requirement, and test evidence.
