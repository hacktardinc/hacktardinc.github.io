---
title: Disable Tamper Protection and any Anti-Malware solution
description: Disable automatic updates
icon: material/wall-fire
# status: new # deprecated
comments: true
# hide:
#     - navigation
#     - toc
---

## Settings

Windows gives you an option to turn Microsoft Defender off. But, it’s only temporary. Once it’s been off for a while, or you restart your PC, it’ll come back on. If you just need a temporary solution, this is it.

1. Access it by going to **Start -> Settings -> Privacy & security.**
2. Select **Windows Security** and scroll until you see **Virus & threat protection settings**. Click the **Manage Settings** link.
    ![image](https://gist.github.com/user-attachments/assets/0b911dc4-f125-4415-bb10-e64511d3183e)
    ![image](https://gist.github.com/user-attachments/assets/16f3f82f-550b-4819-92de-42869ca7ab8d)
    ![image](https://gist.github.com/user-attachments/assets/4708dea5-00cf-4ff8-bb29-a90e32057e71)
3. Toggle the various options to **Off**. 

    ![image](https://gist.github.com/user-attachments/assets/1b49c0c7-4da9-4660-9eb4-5f58c9e096ec)
    ![image](https://gist.github.com/user-attachments/assets/c5eff79f-16c2-460b-94bd-40e306e8124b)

??? note
    Turning everything off is just temporary. This is great if you just need to disable Microsoft Defender for a short while, but doesn’t solve the ultimate goal of turning off Windows Defender permanently.
??? tip
    Note: if you’re already using another antivirus instead of Microsoft Defender, you may not see these settings at all – which is a fix in itself and will be detailed below.

## Local Group Policy

1. Press ++win+r++ to load the Run box, type `gpedit.msc` into the box, and press **OK**.
2. When the Local Group Policy window loads, select **Computer Configuration -> Administrative Templates** on the right.
3. Go to **Windows Components -> Microsoft Defender (Antivirus)**. If you don’t see Microsoft Defender, look for **Windows Defender (Antivirus)**. Scroll down until you see the **Turn off Microsoft Defender** file. For older versions of Windows 10, look for **Turn off Windows Defender**.

    ![image](https://gist.github.com/user-attachments/assets/85564123-e7aa-419f-ba8a-2089f2ae4cb4)

4. Double-click it, and click **Enabled** on the left to turn on the **Turn off Microsoft Defender** policy, which disables Microsoft Defender. If you later change your mind, select **Disabled** instead.

    ![image](https://gist.github.com/user-attachments/assets/2b9e460e-9263-4c5f-a802-eadde98d1716)

## Registry

1. Open the Run command by pressing ++win+r++ . Type `regedit`, and click **OK**.
2. On the left pane of the Registry Editor, navigate to the following folder:
    ```cmd
    HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows Defender
    ```
3. Select the **Windows Defender** folder as shown and right-click on the empty space on the right side of the window, and go to **New -> DWORD (32-bit) Value**.
    ![image](https://gist.github.com/user-attachments/assets/331cc2b1-e406-441e-a9b9-8b238d81a72b)
    Windows will create an untitled DWORD file. Right-click the file, and click **Rename**, then call it **DisableAntiSpyware**. Make sure you enter the name perfectly!
4. Right-click the **DisableAntiSpyware** file, and click **Modify**. To enable the policy that disables Microsoft Defender, set the value data to **1**, and click **OK**. This tells the computer that the policy that was just created should be enabled, and Windows will disable Defender for you. If you want to bring Microsoft Defender back, return to this file, and change the value to **0** to disable the policy and allow Defender to work again.
    
    ![image](https://www.maketecheasier.com/assets/uploads/2017/03/Defender-Permanent-Disable-Set.jpg)
    ![image](https://gist.github.com/user-attachments/assets/2b8b33b9-c1fc-46c5-a989-21b2c8b56cc9)


5. If anything related to Defender is still running, add the following DWORD values in the following folder locations using the same process as above:
    - DisableRealtimeMonitoring – set the value to 1.
    - DisableRoutinelyTakingAction – set the value to 1.
    - DisableAntiVirus – set the value to 1.
    - DisableSpecialRunningModes – set the value to 1.
    - ServiceKeepAlive – set value to 0.
6. You may also need to create three new folders under Windows Defender. Right-click the **Windows Defender** folder, and select **New -> Key**. Add three new Keys: **Signature Updates**, **Real-Time Protection**, and **Spynet**.
7. Add the following DWORD values to the corresponding folders:

    ![image](https://gist.github.com/user-attachments/assets/2b8b33b9-c1fc-46c5-a989-21b2c8b56cc9)


    ```cmd
    HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows Defender\Signature Updates
    ```

    - ForceUpdateFromMU – set value to 0.

        ![image](https://gist.github.com/user-attachments/assets/bc645f14-edb0-4a54-8f01-2831315bcc96)

    ```cmd
    HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows Defender\Real-Time Protection
    ```

    - DisableRealtimeMonitoring – set value to 1.
    - DisableOnAccessProtection – set value to 1.
    - DisableBehaviorMonitoring – set value to 1.
    - DisableScanOnRealtimeEnable – set value to 1.

        ![image](https://gist.github.com/user-attachments/assets/e68f0d30-9452-49ed-af72-8d676f0a6509)


    ```cmd
    HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows Defender\Spynet
    ```

    - DisableBlockAtFirstSeen – set value to 1.

        ![image](https://gist.github.com/user-attachments/assets/efbb8925-c4f4-4f4c-84fa-e4500c00e31d)


### Reference

- [How to Permanently Disable Microsoft Defender](https://www.maketecheasier.com/permanently-disable-windows-defender-windows-10/)
- [How to permanently disable Windows Defender Real Time Protection with GPO?](https://superuser.com/questions/1757339/how-to-permanently-disable-windows-defender-real-time-protection-with-gpo/1757341#1757341)