Feature: Detecting and reporting errors

    Scenario: A crash in the main process
        Given I launch an app
        When I click "main-process-crash"
        Then the app crashed

    Scenario: An unhandled promise rejection in the main process
        Given I launch an app
        When I click "main-process-unhandled-promise-rejection"

    Scenario Outline: An uncaught exception in the main process
        Given I launch an app with configuration:
            | bugsnag | <config> |
        When I click "main-process-uncaught-exception"
        Then the total requests received by the server matches:
            | events  | 1        |
        Then the headers of every event request contains:
            | Bugsnag-API-Key | 100a2272bd2b0ac0ab0f52715bbdc659 |
            | Content-Type    | application/json                 |
        Then the contents of an event request matches "main/uncaught-exception/<config>.json"

        Examples:
            | config          |
            | default         |
            | complex-config  |

    Scenario: An uncaught exception occurs in the main process when reporting is disabled
        Given I launch an app with configuration:
            | bugsnag | disable-uncaught-exceptions |
        When I click "main-process-uncaught-exception"
        Then the total requests received by the server matches:
            | events  | 0                           |

    Scenario: An uncaught exception in the renderer
        Given I launch an app
        When I click "renderer-uncaught-exception"

    Scenario: An unhandled promise rejection in the renderer
        Given I launch an app
        When I click "renderer-unhandled-promise-rejection"
