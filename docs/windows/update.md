---
title: Disable automatic updates
description: Disable automatic updates
icon: material/update
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

## Settings

If you want to prevent the system from downloading a specific update for a short period of time, you do not need to disable Windows Update permanently. Instead, you could pause updates for up to seven days.

To disable automatic updates temporarily, use these steps:

1. Open **Settings**.
2. Click on **Windows Update**.
3. Click the **"Pause updates for 5 Weeks"** option.

    ![image](https://gist.github.com/user-attachments/assets/a65c4d14-a561-4a88-9290-29de5a441a78)
    ![image](https://gist.github.com/user-attachments/assets/191e191e-8e42-47a9-8e11-51fb0b51ba65)

Once you complete the steps, the system won't download for one week. 

??? note

    When it reaches the pause limit, you will need to install the latest patch to make the option available again.

## Group Policy

On Windows 11, the Local Group Policy Editor includes policies to permanently disable automatic updates or change the update settings to choose when patches should be installed on the device.

To disable automatic updates on Windows 10 permanently, use these steps:

1. Open **Start**.
2. Search for **gpedit.msc** and click the top result to launch the **Local Group Policy Editor**.
3. Navigate to the following path: _**Computer Configuration > Administrative Templates > Windows Components > Windows Update > Manage end user experience**_
4. Double-click the **"Configure Automatic Updates"** policy on the right side.

    ![image](https://gist.github.com/user-attachments/assets/4ee01204-6fc7-4739-96db-2916858a8338)

5. Check the **Disabled** option to turn off automatic Windows 11 updates permanently.
6. Click the Apply button.
7. Click the OK button.

    ![image](https://gist.github.com/user-attachments/assets/0c7dc3e5-46a6-4e76-8e9f-8a5b42c6f84c)

After you complete the steps, Windows 11 will stop downloading updates automatically. 

??? tip
    However, the ability to check for updates manually will continue on **Settings > Windows Update**, and clicking the "**Check for updates**" button to download the most recent patches as needed.

??? note
    If you want to enable automatic updates on the computer again, you can use the same instructions outlined above, but in step 5, make sure to select the "Not Configured" option.

## Registry

You can also use the Registry in two different ways to disable automatic updates on Windows 10.


??? danger
    This is a friendly reminder that editing the Registry is risky and can cause irreversible damage to your installation if you don't do it correctly. Before proceeding, it's recommended to make a backup.


To disable Windows 11 updates permanently by changing the Registry settings, use these steps:

1. Open **Start**.
2. Search for **regedit** and click the top result to launch the Registry Editor.
3. Navigate to the following path: _**HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows**_
4. Right-click the **Windows** (folder) key, select the **New** submenu, and choose the **Key** option.
5. Name the new key **WindowsUpdate** and press **Enter**.
6. Right-click the newly created key, select the **New** submenu, and choose the **Key** option.
7. Name the new key **AU** and press **Enter**.
8. Right-click the **AU** key, select the **New** submenu, and choose the **DWORD (32-bit) Value** option.
9. Name the new key **NoAutoUpdate** and press **Enter**.
10. Double-click the newly created key and change its value from **0** to **1**.

    ![image](https://gist.github.com/user-attachments/assets/e9302198-c855-4b97-b0d6-2a86acc77ae1)

11. Click the **OK** button.
12. Restart the computer.

After you complete the steps, automatic updates will be permanently disabled on the device. However, you can still download updates by clicking the **"Check for updates"** button on the Windows Update settings page.

If you want to undo the changes, you can use the same instructions outlined above, but on **step 4**, right-click the WindowsUpdate key, select the **"Delete"** option, then reboot the computer to apply the settings.

### Resources

- [How to stop automatic updates on Windows 10](https://www.windowscentral.com/how-stop-updates-installing-automatically-windows-10)